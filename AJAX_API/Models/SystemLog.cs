using System.ComponentModel.DataAnnotations;

namespace AjaxRomManager.Api.Models
{
    public class SystemLog
    {
        public int Id { get; set; }
        
        public int? UserId { get; set; }
        public User? User { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Level { get; set; } = string.Empty; // Info, Warning, Error, Debug
        
        [MaxLength(50)]
        public string? Category { get; set; }
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public string? Exception { get; set; }
        
        public string? Properties { get; set; } // JSON object for additional data
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        [MaxLength(100)]
        public string? Source { get; set; }
    }
}
