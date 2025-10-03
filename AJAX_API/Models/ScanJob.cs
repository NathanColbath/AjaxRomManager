using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AjaxRomManager.Api.Models
{
    public class ScanJob
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string ScanPath { get; set; } = string.Empty;
        
        public int? PlatformId { get; set; }
        public Platform? Platform { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Running, Completed, Failed, Cancelled
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal Progress { get; set; } = 0;
        
        public int FilesFound { get; set; } = 0;
        
        public int FilesProcessed { get; set; } = 0;
        
        public int Errors { get; set; } = 0;
        
        public DateTime? StartedAt { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        
        public DateTime? LastRunAt { get; set; }
        
        public bool IsRecurring { get; set; } = false;
        
        [MaxLength(100)]
        public string? CronExpression { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
