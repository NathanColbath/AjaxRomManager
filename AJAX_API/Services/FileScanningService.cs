using Microsoft.EntityFrameworkCore;
using AjaxRomManager.Api.Data;
using AjaxRomManager.Api.Models;
using System.Security.Cryptography;
using System.Text.RegularExpressions;

namespace AJAX_API.Services
{
    public interface IFileScanningService
    {
        Task<ScanJob> StartScanAsync(string directoryPath, int? platformId = null, ScanOptions? options = null);
        Task<ScanJob> StartRecurringScanAsync(string directoryPath, string cronExpression, int? platformId = null);
        Task<bool> StopScanAsync(int scanJobId);
        Task<ScanJob?> GetScanJobAsync(int scanJobId);
        Task<IEnumerable<ScanJob>> GetActiveScansAsync();
        Task<PagedResult<ScanJob>> GetScanHistoryAsync(int? platformId = null, int page = 1, int pageSize = 20, string? status = null, DateTime? fromDate = null, DateTime? toDate = null);
        Task<ScanProgress> GetScanProgressAsync(int scanJobId);
        // Scan configuration methods are handled by SystemSettingsService
        Task<bool> IsScanRunningAsync(int scanJobId);
        Task ProcessScanJobAsync(int scanJobId);
        Task<bool> CancelScanAsync(int scanJobId);
        Task<ScanJob?> RetryScanAsync(int scanJobId);
        Task<bool> DeleteScanJobAsync(int scanJobId);
        Task<IEnumerable<string>> GetScanLogsAsync(int scanJobId);
        Task<object> GetScanStatisticsAsync();
    }

    public class FileScanningService : IFileScanningService
    {
        private readonly ApplicationDbContext _context;
        private readonly ISystemSettingsService _settingsService;
        private readonly IPlatformDetectionService _platformDetectionService;
        private readonly IRomsManagmentService _romsService;
        private readonly IScanningNotificationService _notificationService;
        private readonly ILogger<FileScanningService> _logger;
        private readonly Dictionary<int, CancellationTokenSource> _runningScans = new();

        public FileScanningService(
            ApplicationDbContext context,
            ISystemSettingsService settingsService,
            IPlatformDetectionService platformDetectionService,
            IRomsManagmentService romsService,
            IScanningNotificationService notificationService,
            ILogger<FileScanningService> logger)
        {
            _context = context;
            _settingsService = settingsService;
            _platformDetectionService = platformDetectionService;
            _romsService = romsService;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<ScanJob> StartScanAsync(string directoryPath, int? platformId = null, ScanOptions? options = null)
        {
            if (!Directory.Exists(directoryPath))
            {
                throw new DirectoryNotFoundException($"Directory not found: {directoryPath}");
            }

            var config = await GetScanConfigurationAsync();
            var scanOptions = options ?? new ScanOptions
            {
                Recursive = config.Recursive,
                AutoDetectPlatform = config.AutoDetectPlatform,
                CreateMetadata = config.CreateMetadata,
                SkipDuplicates = config.SkipDuplicates,
                MaxFileSizeBytes = config.MaxFileSizeMB * 1024 * 1024,
                IncludeSubdirectories = config.IncludeSubdirectories,
                HashAlgorithm = config.HashAlgorithm,
                PlatformId = platformId
            };

            var scanJob = new ScanJob
            {
                Name = $"Scan: {Path.GetFileName(directoryPath)}",
                ScanPath = directoryPath,
                PlatformId = platformId,
                Status = "Pending",
                Progress = 0,
                CreatedAt = DateTime.UtcNow
            };

            _context.ScanJobs.Add(scanJob);
            await _context.SaveChangesAsync();

            // Notify that a new scan job was created
            await _notificationService.NotifyScanJobCreatedAsync(scanJob);

            _logger.LogInformation("Created scan job {ScanJobId} for directory {DirectoryPath}", scanJob.Id, directoryPath);
            return scanJob;
        }

        public async Task<ScanJob> StartRecurringScanAsync(string directoryPath, string cronExpression, int? platformId = null)
        {
            if (!Directory.Exists(directoryPath))
            {
                throw new DirectoryNotFoundException($"Directory not found: {directoryPath}");
            }

            var scanJob = new ScanJob
            {
                Name = $"Recurring Scan: {Path.GetFileName(directoryPath)}",
                ScanPath = directoryPath,
                PlatformId = platformId,
                Status = "Pending",
                Progress = 0,
                IsRecurring = true,
                CronExpression = cronExpression,
                CreatedAt = DateTime.UtcNow
            };

            _context.ScanJobs.Add(scanJob);
            await _context.SaveChangesAsync();

            // Notify that a new recurring scan job was created
            await _notificationService.NotifyScanJobCreatedAsync(scanJob);

            _logger.LogInformation("Created recurring scan job {ScanJobId} for directory {DirectoryPath}", scanJob.Id, directoryPath);
            return scanJob;
        }

        public async Task<bool> StopScanAsync(int scanJobId)
        {
            var scanJob = await GetScanJobAsync(scanJobId);
            if (scanJob == null || scanJob.Status != "Running")
            {
                return false;
            }

            if (_runningScans.TryGetValue(scanJobId, out var cancellationTokenSource))
            {
                cancellationTokenSource.Cancel();
                _runningScans.Remove(scanJobId);
            }

            scanJob.Status = "Cancelled";
            scanJob.CompletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Notify that the scan was cancelled
            await _notificationService.NotifyScanCancelledAsync(scanJobId, scanJob);

            _logger.LogInformation("Stopped scan job {ScanJobId}", scanJobId);
            return true;
        }

        public async Task<ScanJob?> GetScanJobAsync(int scanJobId)
        {
            return await _context.ScanJobs
                .Include(s => s.Platform)
                .FirstOrDefaultAsync(s => s.Id == scanJobId);
        }

        public async Task<IEnumerable<ScanJob>> GetActiveScansAsync()
        {
            return await _context.ScanJobs
                .Include(s => s.Platform)
                .Where(s => s.Status == "Running" || s.Status == "Pending")
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<PagedResult<ScanJob>> GetScanHistoryAsync(int? platformId = null, int page = 1, int pageSize = 20, string? status = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.ScanJobs
                .Include(s => s.Platform)
                .AsQueryable();

            if (platformId.HasValue)
            {
                query = query.Where(s => s.PlatformId == platformId);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(s => s.Status == status);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(s => s.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(s => s.CreatedAt <= toDate.Value);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<ScanJob>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<ScanProgress> GetScanProgressAsync(int scanJobId)
        {
            var scanJob = await GetScanJobAsync(scanJobId);
            if (scanJob == null)
            {
                throw new ArgumentException($"Scan job {scanJobId} not found");
            }

            var progress = new ScanProgress
            {
                ScanJobId = scanJobId,
                Status = scanJob.Status,
                Progress = scanJob.Progress,
                FilesFound = scanJob.FilesFound,
                FilesProcessed = scanJob.FilesProcessed,
                Errors = scanJob.Errors,
                StartedAt = scanJob.StartedAt,
                ElapsedTime = scanJob.StartedAt.HasValue ? DateTime.UtcNow - scanJob.StartedAt.Value : null
            };

            // Calculate estimated completion
            if (scanJob.StartedAt.HasValue && scanJob.FilesProcessed > 0 && scanJob.Status == "Running")
            {
                var elapsed = DateTime.UtcNow - scanJob.StartedAt.Value;
                var avgTimePerFile = elapsed.TotalMilliseconds / scanJob.FilesProcessed;
                var remainingFiles = scanJob.FilesFound - scanJob.FilesProcessed;
                progress.RemainingTime = TimeSpan.FromMilliseconds(avgTimePerFile * remainingFiles);
                progress.EstimatedCompletion = DateTime.UtcNow.Add(progress.RemainingTime.Value);
            }

            return progress;
        }

        public async Task<string> GetScanDirectoryAsync()
        {
            return await _settingsService.GetScanDirectoryAsync();
        }

        public async Task SetScanDirectoryAsync(string directoryPath)
        {
            await _settingsService.SetScanDirectoryAsync(directoryPath);
        }

        public async Task<ScanConfiguration> GetScanConfigurationAsync()
        {
            return await _settingsService.GetScanConfigurationAsync();
        }

        public async Task UpdateScanConfigurationAsync(ScanConfiguration config)
        {
            await _settingsService.UpdateScanConfigurationAsync(config);
        }

        public async Task<bool> IsScanRunningAsync(int scanJobId)
        {
            var scanJob = await GetScanJobAsync(scanJobId);
            return scanJob?.Status == "Running";
        }

        public async Task ProcessScanJobAsync(int scanJobId)
        {
            var scanJob = await GetScanJobAsync(scanJobId);
            if (scanJob == null || scanJob.Status != "Pending")
            {
                return;
            }

            var cancellationTokenSource = new CancellationTokenSource();
            _runningScans[scanJobId] = cancellationTokenSource;

            try
            {
                scanJob.Status = "Running";
                scanJob.StartedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Notify that scan has started
                await _notificationService.NotifyScanStartedAsync(scanJobId, scanJob);

                var config = await GetScanConfigurationAsync();
                var options = new ScanOptions
                {
                    Recursive = config.Recursive,
                    AutoDetectPlatform = config.AutoDetectPlatform,
                    CreateMetadata = config.CreateMetadata,
                    SkipDuplicates = config.SkipDuplicates,
                    MaxFileSizeBytes = config.MaxFileSizeMB * 1024 * 1024,
                    IncludeSubdirectories = config.IncludeSubdirectories,
                    HashAlgorithm = config.HashAlgorithm,
                    PlatformId = scanJob.PlatformId
                };

                await ProcessDirectoryAsync(scanJob, scanJob.ScanPath, options, cancellationTokenSource.Token);

                scanJob.Status = "Completed";
                scanJob.CompletedAt = DateTime.UtcNow;
                scanJob.Progress = 100;
                await _context.SaveChangesAsync();

                // Notify that scan has completed
                await _notificationService.NotifyScanCompletedAsync(scanJobId, scanJob);

                _logger.LogInformation("Completed scan job {ScanJobId}: {FilesFound} files found, {FilesProcessed} processed, {Errors} errors", 
                    scanJobId, scanJob.FilesFound, scanJob.FilesProcessed, scanJob.Errors);
            }
            catch (OperationCanceledException)
            {
                scanJob.Status = "Cancelled";
                scanJob.CompletedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                
                // Notify that scan was cancelled
                await _notificationService.NotifyScanCancelledAsync(scanJobId, scanJob);
                
                _logger.LogInformation("Scan job {ScanJobId} was cancelled", scanJobId);
            }
            catch (Exception ex)
            {
                scanJob.Status = "Failed";
                scanJob.CompletedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                
                // Notify that scan failed
                await _notificationService.NotifyScanFailedAsync(scanJobId, scanJob, ex.Message);
                
                _logger.LogError(ex, "Scan job {ScanJobId} failed", scanJobId);
            }
            finally
            {
                _runningScans.Remove(scanJobId);
                cancellationTokenSource.Dispose();
            }
        }

        private async Task ProcessDirectoryAsync(ScanJob scanJob, string directoryPath, ScanOptions options, CancellationToken cancellationToken)
        {
            var files = Directory.GetFiles(directoryPath, "*", options.IncludeSubdirectories ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly);
            
            scanJob.FilesFound = files.Length;
            await _context.SaveChangesAsync();

            var filesAdded = 0;
            var filesSkipped = 0;

            for (int i = 0; i < files.Length; i++)
            {
                cancellationToken.ThrowIfCancellationRequested();

                var filePath = files[i];
                var fileName = Path.GetFileName(filePath);

                try
                {
                    // Check file size
                    var fileInfo = new FileInfo(filePath);
                    if (fileInfo.Length > options.MaxFileSizeBytes)
                    {
                        _logger.LogWarning("Skipping file {FileName} - exceeds maximum size", fileName);
                        filesSkipped++;
                        continue;
                    }

                    // Check if it's a valid ROM file
                    if (!await _platformDetectionService.IsValidRomFileAsync(filePath))
                    {
                        continue;
                    }

                    // Detect platform if auto-detection is enabled
                    Platform? platform = null;
                    if (options.AutoDetectPlatform)
                    {
                        platform = await _platformDetectionService.DetectPlatformAsync(filePath, fileName);
                    }
                    else if (options.PlatformId.HasValue)
                    {
                        platform = await _context.Platforms.FindAsync(options.PlatformId.Value);
                    }

                    if (platform == null)
                    {
                        _logger.LogWarning("No platform found for file {FileName}", fileName);
                        continue;
                    }

                    // Check for duplicates if enabled
                    if (options.SkipDuplicates)
                    {
                        var existingRom = await _context.Roms
                            .FirstOrDefaultAsync(r => r.FilePath == filePath || r.FileName == fileName);
                        
                        if (existingRom != null)
                        {
                            _logger.LogDebug("Skipping duplicate file {FileName}", fileName);
                            filesSkipped++;
                            continue;
                        }
                    }

                    // Create ROM entry
                    var rom = new Rom
                    {
                        Title = Path.GetFileNameWithoutExtension(fileName),
                        FilePath = filePath,
                        FileName = fileName,
                        FileSize = fileInfo.Length,
                        FileHash = await CalculateFileHashAsync(filePath, options.HashAlgorithm),
                        PlatformId = platform.Id,
                        DateAdded = DateTime.UtcNow
                    };

                    await _romsService.CreateRom(rom);
                    filesAdded++;

                    _logger.LogDebug("Added ROM: {Title} ({PlatformName})", rom.Title, platform.Name);
                }
                catch (Exception ex)
                {
                    scanJob.Errors++;
                    _logger.LogError(ex, "Error processing file {FilePath}", filePath);
                }

                scanJob.FilesProcessed++;
                scanJob.Progress = (decimal)scanJob.FilesProcessed / scanJob.FilesFound * 100;
                
                // Update progress every 10 files or at the end
                if (scanJob.FilesProcessed % 10 == 0 || scanJob.FilesProcessed == scanJob.FilesFound)
                {
                    await _context.SaveChangesAsync();
                    
                    // Send progress notification
                    var progress = await GetScanProgressAsync(scanJob.Id);
                    await _notificationService.NotifyScanProgressAsync(scanJob.Id, progress);
                }
            }

            _logger.LogInformation("Directory processing completed: {FilesAdded} added, {FilesSkipped} skipped", filesAdded, filesSkipped);
        }

        private async Task<string> CalculateFileHashAsync(string filePath, string algorithm)
        {
            try
            {
                using var stream = File.OpenRead(filePath);
                HashAlgorithm hashAlgorithm = algorithm.ToUpperInvariant() switch
                {
                    "MD5" => MD5.Create(),
                    "SHA1" => SHA1.Create(),
                    "SHA256" => SHA256.Create(),
                    "SHA512" => SHA512.Create(),
                    _ => MD5.Create()
                };
                using var hashAlg = hashAlgorithm;

                var hashBytes = await hashAlg.ComputeHashAsync(stream);
                return Convert.ToHexString(hashBytes).ToLowerInvariant();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating hash for file {FilePath}", filePath);
                return string.Empty;
            }
        }

        public async Task<bool> CancelScanAsync(int scanJobId)
        {
            try
            {
                var scanJob = await _context.ScanJobs.FindAsync(scanJobId);
                if (scanJob == null)
                {
                    return false;
                }

                if (scanJob.Status == "Running")
                {
                    // Cancel the running scan
                    if (_runningScans.TryGetValue(scanJobId, out var cts))
                    {
                        cts.Cancel();
                    }

                    scanJob.Status = "Cancelled";
                    scanJob.CompletedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    // Send notification
                    await _notificationService.NotifyScanCancelledAsync(scanJobId, scanJob);
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling scan job {ScanJobId}", scanJobId);
                return false;
            }
        }

        public async Task<ScanJob?> RetryScanAsync(int scanJobId)
        {
            try
            {
                var originalScanJob = await _context.ScanJobs.FindAsync(scanJobId);
                if (originalScanJob == null || originalScanJob.Status != "Failed")
                {
                    return null;
                }

                // Create a new scan job based on the failed one
                var retryScanJob = new ScanJob
                {
                    Name = $"Retry: {originalScanJob.Name}",
                    ScanPath = originalScanJob.ScanPath,
                    PlatformId = originalScanJob.PlatformId,
                    Status = "Pending",
                    IsRecurring = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ScanJobs.Add(retryScanJob);
                await _context.SaveChangesAsync();

                // Start the retry scan
                await ProcessScanJobAsync(retryScanJob.Id);

                return retryScanJob;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrying scan job {ScanJobId}", scanJobId);
                return null;
            }
        }

        public async Task<bool> DeleteScanJobAsync(int scanJobId)
        {
            try
            {
                var scanJob = await _context.ScanJobs.FindAsync(scanJobId);
                if (scanJob == null)
                {
                    return false;
                }

                // Don't delete running scans
                if (scanJob.Status == "Running")
                {
                    return false;
                }

                _context.ScanJobs.Remove(scanJob);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting scan job {ScanJobId}", scanJobId);
                return false;
            }
        }

        public async Task<IEnumerable<string>> GetScanLogsAsync(int scanJobId)
        {
            try
            {
                var scanJob = await _context.ScanJobs.FindAsync(scanJobId);
                if (scanJob == null)
                {
                    throw new ArgumentException($"Scan job {scanJobId} not found");
                }

                // For now, return basic log information
                // In a real implementation, you might want to store detailed logs
                var logs = new List<string>
                {
                    $"Scan Job: {scanJob.Name}",
                    $"Status: {scanJob.Status}",
                    $"Created: {scanJob.CreatedAt}",
                    $"Files Found: {scanJob.FilesFound}",
                    $"Files Processed: {scanJob.FilesProcessed}",
                    $"Errors: {scanJob.Errors}"
                };

                if (scanJob.StartedAt.HasValue)
                {
                    logs.Add($"Started: {scanJob.StartedAt}");
                }

                if (scanJob.CompletedAt.HasValue)
                {
                    logs.Add($"Completed: {scanJob.CompletedAt}");
                }

                return logs;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scan logs for job {ScanJobId}", scanJobId);
                throw new InvalidOperationException("Failed to retrieve scan logs");
            }
        }

        public async Task<object> GetScanStatisticsAsync()
        {
            try
            {
                var totalScans = await _context.ScanJobs.CountAsync();
                var completedScans = await _context.ScanJobs.CountAsync(s => s.Status == "Completed");
                var failedScans = await _context.ScanJobs.CountAsync(s => s.Status == "Failed");
                var runningScans = await _context.ScanJobs.CountAsync(s => s.Status == "Running");
                var totalFilesFound = await _context.ScanJobs.SumAsync(s => s.FilesFound);
                var totalFilesProcessed = await _context.ScanJobs.SumAsync(s => s.FilesProcessed);
                var totalErrors = await _context.ScanJobs.SumAsync(s => s.Errors);

                return new
                {
                    TotalScans = totalScans,
                    CompletedScans = completedScans,
                    FailedScans = failedScans,
                    RunningScans = runningScans,
                    TotalFilesFound = totalFilesFound,
                    TotalFilesProcessed = totalFilesProcessed,
                    TotalErrors = totalErrors,
                    SuccessRate = totalScans > 0 ? (double)completedScans / totalScans * 100 : 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scan statistics");
                throw new InvalidOperationException("Failed to retrieve scan statistics");
            }
        }
    }
}
