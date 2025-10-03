using System.ComponentModel.DataAnnotations;

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
        
        public long FileSize { get; set; }
        
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;
        
        public DateTime? LastPlayed { get; set; }
        
        public int PlayCount { get; set; } = 0;
        
        public int PlatformId { get; set; }
        public Platform? Platform { get; set; }
        
        public string? Description { get; set; }
        
        public string? CoverImagePath { get; set; }
    }

    public class Platform
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(10)]
        public string? Extension { get; set; }
        
        public string? EmulatorPath { get; set; }
        
        public string? EmulatorArguments { get; set; }
        
        public List<Rom> Roms { get; set; } = new();
    }
}

