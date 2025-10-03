using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AjaxRomManager.Api.Models
{
    public class Rom
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;
        
        [MaxLength(255)]
        public string? FileName { get; set; }
        
        public long FileSize { get; set; }
        
        [MaxLength(64)]
        public string? FileHash { get; set; }
        
        public int PlatformId { get; set; }
        public Platform? Platform { get; set; }
        
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;
        
        public DateTime? LastPlayed { get; set; }
        
        public int PlayCount { get; set; } = 0;
        
        public bool IsFavorite { get; set; } = false;
        
        public bool IsArchived { get; set; } = false;
        
        // Navigation properties
        public RomMetadata? Metadata { get; set; }
    }

    public class Platform
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(10)]
        public string? Extension { get; set; }
        
        [MaxLength(500)]
        public string? EmulatorPath { get; set; }
        
        [MaxLength(500)]
        public string? EmulatorArguments { get; set; }
        
        [MaxLength(500)]
        public string? IconPath { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public List<Rom> Roms { get; set; } = new();
        public List<ScanJob> ScanJobs { get; set; } = new();
    }
}
