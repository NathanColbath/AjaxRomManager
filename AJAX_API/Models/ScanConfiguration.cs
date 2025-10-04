using System.ComponentModel.DataAnnotations;

namespace AjaxRomManager.Api.Models
{
    public class ScanConfiguration
    {
        [Required]
        public string DefaultDirectory { get; set; } = string.Empty;
        
        public bool Recursive { get; set; } = true;
        
        public bool AutoDetectPlatform { get; set; } = true;
        
        public bool CreateMetadata { get; set; } = true;
        
        public bool SkipDuplicates { get; set; } = true;
        
        public int MaxFileSizeMB { get; set; } = 1024; // 1GB default
        
        public string HashAlgorithm { get; set; } = "MD5";
        
        public bool IncludeSubdirectories { get; set; } = true;
        
        public string[] DefaultFilePatterns { get; set; } = Array.Empty<string>();
        
        public string[] DefaultExcludePatterns { get; set; } = Array.Empty<string>();
        
        public int ProgressUpdateIntervalSeconds { get; set; } = 5;
        
        public bool EnableBackgroundScanning { get; set; } = true;
        
        public int MaxConcurrentScans { get; set; } = 3;
    }
}
