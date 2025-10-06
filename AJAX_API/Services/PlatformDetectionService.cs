using Microsoft.EntityFrameworkCore;
using AjaxRomManager.Api.Data;
using AjaxRomManager.Api.Models;

namespace AJAX_API.Services
{
    public interface IPlatformDetectionService
    {
        Task<Platform?> DetectPlatformAsync(string filePath, string fileName);
        Task<List<string>> GetSupportedExtensionsAsync();
        Task<bool> IsValidRomFileAsync(string filePath);
        Task<Platform?> GetPlatformByExtensionAsync(string extension);
        Task<List<Platform>> GetAllActivePlatformsAsync();
    }

    public class PlatformDetectionService : IPlatformDetectionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PlatformDetectionService> _logger;
        private readonly Dictionary<string, Platform> _extensionCache = new();
        private DateTime _cacheLastUpdated = DateTime.MinValue;
        private readonly TimeSpan _cacheExpiry = TimeSpan.FromMinutes(5);

        public PlatformDetectionService(ApplicationDbContext context, ILogger<PlatformDetectionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Platform?> DetectPlatformAsync(string filePath, string fileName)
        {
            try
            {
                var extension = Path.GetExtension(fileName).ToLowerInvariant();
                if (string.IsNullOrEmpty(extension))
                {
                    _logger.LogWarning("No file extension found for file: {FileName}", fileName);
                    return null;
                }

                // Remove the dot from extension
                extension = extension.Substring(1);

                var platform = await GetPlatformByExtensionAsync(extension);
                if (platform != null)
                {
                    _logger.LogDebug("Detected platform {PlatformName} for file {FileName}", platform.Name, fileName);
                    return platform;
                }

                _logger.LogWarning("No platform found for extension: {Extension} (file: {FileName})", extension, fileName);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting platform for file: {FilePath}", filePath);
                return null;
            }
        }

        public async Task<List<string>> GetSupportedExtensionsAsync()
        {
            var platforms = await GetAllActivePlatformsAsync();
            var extensions = new HashSet<string>();

            foreach (var platform in platforms)
            {
                foreach (var ext in platform.ExtensionList)
                {
                    extensions.Add(ext.ToLowerInvariant());
                }
            }

            return extensions.ToList();
        }

        public async Task<bool> IsValidRomFileAsync(string filePath)
        {
            try
            {
                if (!File.Exists(filePath))
                {
                    return false;
                }

                var fileName = Path.GetFileName(filePath);
                var extension = Path.GetExtension(fileName).ToLowerInvariant();
                
                if (string.IsNullOrEmpty(extension))
                {
                    return false;
                }

                // Remove the dot from extension
                extension = extension.Substring(1);

                var supportedExtensions = await GetSupportedExtensionsAsync();
                return supportedExtensions.Contains(extension);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating ROM file: {FilePath}", filePath);
                return false;
            }
        }

        public async Task<Platform?> GetPlatformByExtensionAsync(string extension)
        {
            await RefreshCacheIfNeededAsync();

            var normalizedExtension = extension.ToLowerInvariant();
            return _extensionCache.TryGetValue(normalizedExtension, out var platform) ? platform : null;
        }

        public async Task<List<Platform>> GetAllActivePlatformsAsync()
        {
            return await _context.Platforms
                .Where(p => p.IsActive)
                .ToListAsync();
        }

        private async Task RefreshCacheIfNeededAsync()
        {
            if (DateTime.UtcNow - _cacheLastUpdated > _cacheExpiry)
            {
                await RefreshCacheAsync();
            }
        }

        private async Task RefreshCacheAsync()
        {
            try
            {
                _extensionCache.Clear();
                
                var platforms = await GetAllActivePlatformsAsync();
                
                foreach (var platform in platforms)
                {
                    foreach (var extension in platform.ExtensionList)
                    {
                        var normalizedExtension = extension.ToLowerInvariant();
                        if (!_extensionCache.ContainsKey(normalizedExtension))
                        {
                            _extensionCache[normalizedExtension] = platform;
                        }
                    }
                }

                _cacheLastUpdated = DateTime.UtcNow;
                _logger.LogDebug("Platform extension cache refreshed with {Count} entries", _extensionCache.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing platform extension cache");
            }
        }
    }
}
