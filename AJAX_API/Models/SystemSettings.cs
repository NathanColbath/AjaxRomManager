using System.ComponentModel.DataAnnotations;

namespace AjaxRomManager.Api.Models
{
    public class SystemSettings
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Key { get; set; } = string.Empty;
        
        public string? Value { get; set; }
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [MaxLength(50)]
        public string? Category { get; set; }
        
        [MaxLength(20)]
        public string? DataType { get; set; } = "String"; // String, Int, Bool, Decimal, JSON
        
        public bool IsEncrypted { get; set; } = false;
        
        public bool IsReadOnly { get; set; } = false;
        
        public DateTime LastModified { get; set; } = DateTime.UtcNow;
        
        [MaxLength(100)]
        public string? ModifiedBy { get; set; }
    }
}
