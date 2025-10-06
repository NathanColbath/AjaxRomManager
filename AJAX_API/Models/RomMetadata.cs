using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AjaxRomManager.Api.Models
{
    public class RomMetadata
    {
        public int Id { get; set; }
        
        public int RomId { get; set; }
        public Rom? Rom { get; set; }
        
        public string? Description { get; set; }
        
        [MaxLength(100)]
        public string? Genre { get; set; }
        
        [MaxLength(100)]
        public string? Developer { get; set; }
        
        [MaxLength(100)]
        public string? Publisher { get; set; }
        
        public DateTime? ReleaseDate { get; set; }
        
        [Column(TypeName = "decimal(3,2)")]
        public decimal? Rating { get; set; }
        
        [MaxLength(500)]
        public string? CoverImagePath { get; set; }
        
        public string? ScreenshotPaths { get; set; } // JSON array of paths
        
        public string? Tags { get; set; } // JSON array of tags
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
