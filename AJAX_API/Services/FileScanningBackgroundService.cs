using AjaxRomManager.Api.Services;
using Microsoft.EntityFrameworkCore;
using AjaxRomManager.Api.Data;
using AjaxRomManager.Api.Models;

namespace AJAX_API.Services
{
    public class FileScanningBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<FileScanningBackgroundService> _logger;
        private readonly SemaphoreSlim _scanSemaphore;

        public FileScanningBackgroundService(IServiceProvider serviceProvider, ILogger<FileScanningBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            
            // Create semaphore with default max concurrent scans
            _scanSemaphore = new SemaphoreSlim(3, 3); // Default to 3 concurrent scans
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("File scanning background service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessPendingScansAsync(stoppingToken);
                    await ProcessRecurringScansAsync(stoppingToken);
                    
                    // Wait 30 seconds before next iteration
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    // Expected when cancellation is requested
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in file scanning background service");
                    // Wait a bit longer before retrying on error
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
            }

            _logger.LogInformation("File scanning background service stopped");
        }

        private async Task ProcessPendingScansAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var scanningService = scope.ServiceProvider.GetRequiredService<IFileScanningService>();

            try
            {
                // Get pending scan jobs
                var pendingScans = await context.ScanJobs
                    .Where(s => s.Status == "Pending")
                    .OrderBy(s => s.CreatedAt)
                    .Take(10) // Process up to 10 pending scans at a time
                    .ToListAsync(cancellationToken);

                if (pendingScans.Any())
                {
                    _logger.LogDebug("Found {Count} pending scan jobs", pendingScans.Count);
                }

                // Process each pending scan
                foreach (var scanJob in pendingScans)
                {
                    if (cancellationToken.IsCancellationRequested)
                        break;

                    await ProcessScanJobAsync(scanJob, scanningService, cancellationToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing pending scans");
            }
        }

        private async Task ProcessRecurringScansAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var scanningService = scope.ServiceProvider.GetRequiredService<IFileScanningService>();

            try
            {
                // Get recurring scan jobs that need to be executed
                var recurringScans = await context.ScanJobs
                    .Where(s => s.IsRecurring && !string.IsNullOrEmpty(s.CronExpression))
                    .ToListAsync(cancellationToken);

                foreach (var scanJob in recurringScans)
                {
                    if (cancellationToken.IsCancellationRequested)
                        break;

                    if (ShouldExecuteRecurringScan(scanJob))
                    {
                        _logger.LogInformation("Executing recurring scan job {ScanJobId}", scanJob.Id);
                        
                        // Create a new scan job for this execution
                        var newScanJob = new ScanJob
                        {
                            Name = $"Recurring: {scanJob.Name}",
                            ScanPath = scanJob.ScanPath,
                            PlatformId = scanJob.PlatformId,
                            Status = "Pending",
                            Progress = 0,
                            CreatedAt = DateTime.UtcNow
                        };

                        context.ScanJobs.Add(newScanJob);
                        scanJob.LastRunAt = DateTime.UtcNow;
                        await context.SaveChangesAsync(cancellationToken);

                        // Process the new scan job
                        await ProcessScanJobAsync(newScanJob, scanningService, cancellationToken);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing recurring scans");
            }
        }

        private async Task ProcessScanJobAsync(ScanJob scanJob, IFileScanningService scanningService, CancellationToken cancellationToken)
        {
            // Check if we can acquire a semaphore slot
            if (!await _scanSemaphore.WaitAsync(1000, cancellationToken))
            {
                _logger.LogWarning("Unable to acquire semaphore slot for scan job {ScanJobId}", scanJob.Id);
                return;
            }

            try
            {
                _logger.LogInformation("Starting background processing for scan job {ScanJobId}", scanJob.Id);
                await scanningService.ProcessScanJobAsync(scanJob.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing scan job {ScanJobId}", scanJob.Id);
            }
            finally
            {
                _scanSemaphore.Release();
            }
        }

        private bool ShouldExecuteRecurringScan(ScanJob scanJob)
        {
            if (string.IsNullOrEmpty(scanJob.CronExpression))
                return false;

            try
            {
                // Simple cron expression evaluation (you might want to use a proper cron library)
                // This is a basic implementation - for production, consider using Quartz.NET or similar
                return EvaluateCronExpression(scanJob.CronExpression, scanJob.LastRunAt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error evaluating cron expression for scan job {ScanJobId}: {CronExpression}", 
                    scanJob.Id, scanJob.CronExpression);
                return false;
            }
        }

        private bool EvaluateCronExpression(string cronExpression, DateTime? lastRunAt)
        {
            // This is a simplified cron evaluation
            // For production use, consider using Quartz.NET or similar library
            
            var now = DateTime.UtcNow;
            var lastRun = lastRunAt ?? DateTime.MinValue;

            // Simple patterns for common use cases
            switch (cronExpression.ToLowerInvariant())
            {
                case "daily":
                case "0 0 * * *":
                    return now.Date > lastRun.Date;
                
                case "hourly":
                case "0 * * * *":
                    return now.Hour != lastRun.Hour || now.Date > lastRun.Date;
                
                case "weekly":
                case "0 0 * * 0":
                    return now.Date > lastRun.Date && now.DayOfWeek == DayOfWeek.Sunday;
                
                case "monthly":
                case "0 0 1 * *":
                    return now.Date > lastRun.Date && now.Day == 1;
                
                default:
                    // For more complex expressions, you'd need a proper cron parser
                    _logger.LogWarning("Unsupported cron expression: {CronExpression}", cronExpression);
                    return false;
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Stopping file scanning background service");
            await base.StopAsync(cancellationToken);
            _scanSemaphore.Dispose();
        }
    }
}
