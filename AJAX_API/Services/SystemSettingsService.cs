using Microsoft.EntityFrameworkCore;
using AjaxRomManager.Api.Data;
using AjaxRomManager.Api.Models;

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
            
            config.DefaultDirectory = await GetSettingAsync("scan.default_directory") ?? "C:\\Roms";
            config.Recursive = await GetSettingAsync<bool>("scan.recursive") ?? true;
            config.AutoDetectPlatform = await GetSettingAsync<bool>("scan.auto_detect_platform") ?? true;
            config.CreateMetadata = await GetSettingAsync<bool>("scan.create_metadata") ?? true;
            config.SkipDuplicates = await GetSettingAsync<bool>("scan.skip_duplicates") ?? true;
            config.MaxFileSizeMB = await GetSettingAsync<int>("scan.max_file_size_mb") ?? 1024;
            config.HashAlgorithm = await GetSettingAsync("scan.file_hash_algorithm") ?? "MD5";
            config.IncludeSubdirectories = await GetSettingAsync<bool>("scan.include_subdirectories") ?? true;
            config.ProgressUpdateIntervalSeconds = await GetSettingAsync<int>("scan.progress_update_interval") ?? 5;
            config.EnableBackgroundScanning = await GetSettingAsync<bool>("scan.enable_background") ?? true;
            config.MaxConcurrentScans = await GetSettingAsync<int>("scan.max_concurrent") ?? 3;

            // Parse JSON arrays for patterns
            var filePatterns = await GetSettingAsync("scan.default_file_patterns");
            var excludePatterns = await GetSettingAsync("scan.default_exclude_patterns");
            
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
            await SetSettingAsync("scan.default_directory", config.DefaultDirectory, "Scanning", "Default directory for ROM scanning");
            await SetSettingAsync("scan.recursive", config.Recursive, "Scanning", "Whether to scan subdirectories recursively");
            await SetSettingAsync("scan.auto_detect_platform", config.AutoDetectPlatform, "Scanning", "Automatically detect platform from file extension");
            await SetSettingAsync("scan.create_metadata", config.CreateMetadata, "Scanning", "Create metadata for scanned ROMs");
            await SetSettingAsync("scan.skip_duplicates", config.SkipDuplicates, "Scanning", "Skip files that already exist in database");
            await SetSettingAsync("scan.max_file_size_mb", config.MaxFileSizeMB, "Scanning", "Maximum file size in MB");
            await SetSettingAsync("scan.file_hash_algorithm", config.HashAlgorithm, "Scanning", "Hash algorithm for file integrity");
            await SetSettingAsync("scan.include_subdirectories", config.IncludeSubdirectories, "Scanning", "Include subdirectories in scan");
            await SetSettingAsync("scan.progress_update_interval", config.ProgressUpdateIntervalSeconds, "Scanning", "Progress update interval in seconds");
            await SetSettingAsync("scan.enable_background", config.EnableBackgroundScanning, "Scanning", "Enable background scanning");
            await SetSettingAsync("scan.max_concurrent", config.MaxConcurrentScans, "Scanning", "Maximum concurrent scan jobs");

            // Serialize arrays to JSON
            if (config.DefaultFilePatterns.Length > 0)
            {
                var filePatternsJson = System.Text.Json.JsonSerializer.Serialize(config.DefaultFilePatterns);
                await SetSettingAsync("scan.default_file_patterns", filePatternsJson, "Scanning", "Default file patterns to include");
            }

            if (config.DefaultExcludePatterns.Length > 0)
            {
                var excludePatternsJson = System.Text.Json.JsonSerializer.Serialize(config.DefaultExcludePatterns);
                await SetSettingAsync("scan.default_exclude_patterns", excludePatternsJson, "Scanning", "Default patterns to exclude");
            }
        }

        public async Task<string> GetScanDirectoryAsync()
        {
            return await GetSettingAsync("scan.default_directory") ?? "C:\\Roms";
        }

        public async Task SetScanDirectoryAsync(string directoryPath)
        {
            await SetSettingAsync("scan.default_directory", directoryPath, "Scanning", "Default directory for ROM scanning");
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
    }
}
