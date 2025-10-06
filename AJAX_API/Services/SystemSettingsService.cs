using Microsoft.EntityFrameworkCore;
using AjaxRomManager.Api.Data;
using AjaxRomManager.Api.Models;
using AJAX_API.Constants;

namespace AJAX_API.Services
{
    public interface ISystemSettingsService
    {
        Task<string?> GetSettingAsync(string key);
        Task<T?> GetSettingAsync<T>(string key) where T : struct;
        Task SetSettingAsync(string key, string value, string? category = null, string? description = null);
        Task SetSettingAsync<T>(string key, T value, string? category = null, string? description = null) where T : struct;
        Task<ScanConfiguration> GetScanConfigurationAsync();
        Task UpdateScanConfigurationAsync(ScanConfiguration config);
        Task<string> GetScanDirectoryAsync();
        Task SetScanDirectoryAsync(string directoryPath);
        Task<bool> SettingExistsAsync(string key);
        Task DeleteSettingAsync(string key);
        Task ResetDatabaseAsync();
        Task<int> DeleteLocalDataAsync();
    }

    public class SystemSettingsService : ISystemSettingsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SystemSettingsService> _logger;

        public SystemSettingsService(ApplicationDbContext context, ILogger<SystemSettingsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<string?> GetSettingAsync(string key)
        {
            var setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == key);
            return setting?.Value;
        }

        public async Task<T?> GetSettingAsync<T>(string key) where T : struct
        {
            var value = await GetSettingAsync(key);
            if (string.IsNullOrEmpty(value)) return null;

            try
            {
                return (T)Convert.ChangeType(value, typeof(T));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to convert setting {Key} with value {Value} to type {Type}", key, value, typeof(T).Name);
                return null;
            }
        }

        public async Task SetSettingAsync(string key, string value, string? category = null, string? description = null)
        {
            var existingSetting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == key);

            if (existingSetting != null)
            {
                existingSetting.Value = value;
                existingSetting.LastModified = DateTime.UtcNow;
                if (!string.IsNullOrEmpty(category)) existingSetting.Category = category;
                if (!string.IsNullOrEmpty(description)) existingSetting.Description = description;
            }
            else
            {
                var newSetting = new SystemSettings
                {
                    Key = key,
                    Value = value,
                    Category = category,
                    Description = description,
                    DataType = "String",
                    LastModified = DateTime.UtcNow
                };
                _context.SystemSettings.Add(newSetting);
            }

            await _context.SaveChangesAsync();
        }

        public async Task SetSettingAsync<T>(string key, T value, string? category = null, string? description = null) where T : struct
        {
            var stringValue = value.ToString();
            var dataType = typeof(T).Name;
            
            var existingSetting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == key);

            if (existingSetting != null)
            {
                existingSetting.Value = stringValue;
                existingSetting.DataType = dataType;
                existingSetting.LastModified = DateTime.UtcNow;
                if (!string.IsNullOrEmpty(category)) existingSetting.Category = category;
                if (!string.IsNullOrEmpty(description)) existingSetting.Description = description;
            }
            else
            {
                var newSetting = new SystemSettings
                {
                    Key = key,
                    Value = stringValue,
                    Category = category,
                    Description = description,
                    DataType = dataType,
                    LastModified = DateTime.UtcNow
                };
                _context.SystemSettings.Add(newSetting);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<ScanConfiguration> GetScanConfigurationAsync()
        {
            var config = new ScanConfiguration();
            
            config.DefaultDirectory = await GetSettingAsync(SystemSettingsConstants.SCAN_DEFAULT_DIRECTORY) ?? SystemSettingsConstants.DefaultValues.DEFAULT_SCAN_DIRECTORY;
            config.Recursive = await GetSettingAsync<bool>(SystemSettingsConstants.SCAN_RECURSIVE) ?? true;
            config.AutoDetectPlatform = await GetSettingAsync<bool>(SystemSettingsConstants.SCAN_AUTO_DETECT_PLATFORM) ?? true;
            config.CreateMetadata = await GetSettingAsync<bool>(SystemSettingsConstants.SCAN_CREATE_METADATA) ?? true;
            config.SkipDuplicates = await GetSettingAsync<bool>(SystemSettingsConstants.SCAN_SKIP_DUPLICATES) ?? true;
            config.MaxFileSizeMB = await GetSettingAsync<int>(SystemSettingsConstants.SCAN_MAX_FILE_SIZE_MB) ?? SystemSettingsConstants.DefaultValues.DEFAULT_MAX_FILE_SIZE_MB;
            config.HashAlgorithm = await GetSettingAsync(SystemSettingsConstants.SCAN_FILE_HASH_ALGORITHM) ?? SystemSettingsConstants.DefaultValues.DEFAULT_HASH_ALGORITHM;
            config.IncludeSubdirectories = await GetSettingAsync<bool>(SystemSettingsConstants.SCAN_INCLUDE_SUBDIRECTORIES) ?? true;
            config.ProgressUpdateIntervalSeconds = await GetSettingAsync<int>(SystemSettingsConstants.SCAN_PROGRESS_UPDATE_INTERVAL) ?? SystemSettingsConstants.DefaultValues.DEFAULT_PROGRESS_UPDATE_INTERVAL;
            config.EnableBackgroundScanning = await GetSettingAsync<bool>(SystemSettingsConstants.SCAN_ENABLE_BACKGROUND) ?? true;
            config.MaxConcurrentScans = await GetSettingAsync<int>(SystemSettingsConstants.SCAN_MAX_CONCURRENT) ?? SystemSettingsConstants.DefaultValues.DEFAULT_MAX_CONCURRENT_SCANS;

            // Parse JSON arrays for patterns
            var filePatterns = await GetSettingAsync(SystemSettingsConstants.SCAN_DEFAULT_FILE_PATTERNS);
            var excludePatterns = await GetSettingAsync(SystemSettingsConstants.SCAN_DEFAULT_EXCLUDE_PATTERNS);
            
            if (!string.IsNullOrEmpty(filePatterns))
            {
                try
                {
                    config.DefaultFilePatterns = System.Text.Json.JsonSerializer.Deserialize<string[]>(filePatterns) ?? Array.Empty<string>();
                }
                catch
                {
                    config.DefaultFilePatterns = Array.Empty<string>();
                }
            }

            if (!string.IsNullOrEmpty(excludePatterns))
            {
                try
                {
                    config.DefaultExcludePatterns = System.Text.Json.JsonSerializer.Deserialize<string[]>(excludePatterns) ?? Array.Empty<string>();
                }
                catch
                {
                    config.DefaultExcludePatterns = Array.Empty<string>();
                }
            }

            return config;
        }

        public async Task UpdateScanConfigurationAsync(ScanConfiguration config)
        {
            await SetSettingAsync(SystemSettingsConstants.SCAN_DEFAULT_DIRECTORY, config.DefaultDirectory, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_DEFAULT_DIRECTORY_DESC);
            await SetSettingAsync(SystemSettingsConstants.SCAN_RECURSIVE, config.Recursive, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_RECURSIVE_DESC);
            await SetSettingAsync(SystemSettingsConstants.SCAN_AUTO_DETECT_PLATFORM, config.AutoDetectPlatform, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_AUTO_DETECT_PLATFORM_DESC);
            await SetSettingAsync(SystemSettingsConstants.SCAN_CREATE_METADATA, config.CreateMetadata, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_CREATE_METADATA_DESC);
            await SetSettingAsync(SystemSettingsConstants.SCAN_SKIP_DUPLICATES, config.SkipDuplicates, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_SKIP_DUPLICATES_DESC);
            await SetSettingAsync(SystemSettingsConstants.SCAN_MAX_FILE_SIZE_MB, config.MaxFileSizeMB, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_MAX_FILE_SIZE_MB_DESC);
            await SetSettingAsync(SystemSettingsConstants.SCAN_FILE_HASH_ALGORITHM, config.HashAlgorithm, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_FILE_HASH_ALGORITHM_DESC);
            await SetSettingAsync(SystemSettingsConstants.SCAN_INCLUDE_SUBDIRECTORIES, config.IncludeSubdirectories, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_INCLUDE_SUBDIRECTORIES_DESC);
            await SetSettingAsync(SystemSettingsConstants.SCAN_PROGRESS_UPDATE_INTERVAL, config.ProgressUpdateIntervalSeconds, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_PROGRESS_UPDATE_INTERVAL_DESC);
            await SetSettingAsync(SystemSettingsConstants.SCAN_ENABLE_BACKGROUND, config.EnableBackgroundScanning, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_ENABLE_BACKGROUND_DESC);
            await SetSettingAsync(SystemSettingsConstants.SCAN_MAX_CONCURRENT, config.MaxConcurrentScans, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_MAX_CONCURRENT_DESC);

            // Serialize arrays to JSON
            if (config.DefaultFilePatterns.Length > 0)
            {
                var filePatternsJson = System.Text.Json.JsonSerializer.Serialize(config.DefaultFilePatterns);
                await SetSettingAsync(SystemSettingsConstants.SCAN_DEFAULT_FILE_PATTERNS, filePatternsJson, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_DEFAULT_FILE_PATTERNS_DESC);
            }

            if (config.DefaultExcludePatterns.Length > 0)
            {
                var excludePatternsJson = System.Text.Json.JsonSerializer.Serialize(config.DefaultExcludePatterns);
                await SetSettingAsync(SystemSettingsConstants.SCAN_DEFAULT_EXCLUDE_PATTERNS, excludePatternsJson, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_DEFAULT_EXCLUDE_PATTERNS_DESC);
            }
        }

        public async Task<string> GetScanDirectoryAsync()
        {
            return await GetSettingAsync(SystemSettingsConstants.SCAN_DEFAULT_DIRECTORY) ?? SystemSettingsConstants.DefaultValues.DEFAULT_SCAN_DIRECTORY;
        }

        public async Task SetScanDirectoryAsync(string directoryPath)
        {
            await SetSettingAsync(SystemSettingsConstants.SCAN_DEFAULT_DIRECTORY, directoryPath, SystemSettingsConstants.Categories.SCANNING, SystemSettingsConstants.Descriptions.SCAN_DEFAULT_DIRECTORY_DESC);
        }

        public async Task<bool> SettingExistsAsync(string key)
        {
            return await _context.SystemSettings.AnyAsync(s => s.Key == key);
        }

        public async Task DeleteSettingAsync(string key)
        {
            var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
            if (setting != null)
            {
                _context.SystemSettings.Remove(setting);
                await _context.SaveChangesAsync();
            }
        }

        /// <summary>
        /// Resets the database by clearing all data
        /// </summary>
        public async Task ResetDatabaseAsync()
        {
            try
            {
                // Clear all tables in the correct order (respecting foreign key constraints)
                _context.RomMetadata.RemoveRange(_context.RomMetadata);
                _context.Roms.RemoveRange(_context.Roms);
                _context.ScanJobs.RemoveRange(_context.ScanJobs);
                _context.Platforms.RemoveRange(_context.Platforms);
                _context.SystemSettings.RemoveRange(_context.SystemSettings);
                _context.UserPreferences.RemoveRange(_context.UserPreferences);
                _context.Users.RemoveRange(_context.Users);
                _context.SystemLogs.RemoveRange(_context.SystemLogs);

                await _context.SaveChangesAsync();
                
                _logger.LogWarning("Database has been completely reset - all data cleared");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting database");
                throw;
            }
        }

        /// <summary>
        /// Deletes all local data (images and ROMs)
        /// </summary>
        /// <returns>Number of files deleted</returns>
        public async Task<int> DeleteLocalDataAsync()
        {
            int deletedFiles = 0;
            
            try
            {
                // Get working ROM directory from settings
                var workingRomDir = await GetSettingAsync(SystemSettingsConstants.SCAN_DEFAULT_DIRECTORY);
                if (string.IsNullOrEmpty(workingRomDir))
                {
                    workingRomDir = SystemSettingsConstants.DefaultValues.DEFAULT_SCAN_DIRECTORY;
                }

                // Delete ROM files
                if (Directory.Exists(workingRomDir))
                {
                    var romFiles = Directory.GetFiles(workingRomDir, "*", SearchOption.AllDirectories);
                    foreach (var file in romFiles)
                    {
                        try
                        {
                            File.Delete(file);
                            deletedFiles++;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Could not delete file: {FilePath}", file);
                        }
                    }
                }

                // Delete uploads directory (fallback)
                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
                if (Directory.Exists(uploadsDir))
                {
                    var uploadFiles = Directory.GetFiles(uploadsDir, "*", SearchOption.AllDirectories);
                    foreach (var file in uploadFiles)
                    {
                        try
                        {
                            File.Delete(file);
                            deletedFiles++;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Could not delete file: {FilePath}", file);
                        }
                    }
                }

                // Delete images directory
                var imagesDir = Path.Combine(Directory.GetCurrentDirectory(), "images");
                if (Directory.Exists(imagesDir))
                {
                    var imageFiles = Directory.GetFiles(imagesDir, "*", SearchOption.AllDirectories);
                    foreach (var file in imageFiles)
                    {
                        try
                        {
                            File.Delete(file);
                            deletedFiles++;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Could not delete file: {FilePath}", file);
                        }
                    }
                }

                _logger.LogWarning("Local data deletion completed - {FileCount} files deleted", deletedFiles);
                return deletedFiles;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting local data");
                throw;
            }
        }
    }
}
