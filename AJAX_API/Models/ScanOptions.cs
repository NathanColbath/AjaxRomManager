using System.ComponentModel.DataAnnotations;

namespace AjaxRomManager.Api.Models
{
    public class ScanOptions
    {
        public bool Recursive { get; set; } = true;
        
        public bool AutoDetectPlatform { get; set; } = true;
        
        public bool CreateMetadata { get; set; } = true;
        
        public bool SkipDuplicates { get; set; } = true;
        
        public long MaxFileSizeBytes { get; set; } = 1073741824; // 1GB default
        
        public string[] FilePatterns { get; set; } = Array.Empty<string>();
        
        public string[] ExcludePatterns { get; set; } = Array.Empty<string>();
        
        public string HashAlgorithm { get; set; } = "MD5";
        
        public bool IncludeSubdirectories { get; set; } = true;
        
        public int? PlatformId { get; set; }
        
        public string ScanType { get; set; } = "Full"; // Full, Incremental, Custom
    }
}
