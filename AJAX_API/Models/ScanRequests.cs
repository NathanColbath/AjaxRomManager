using System.ComponentModel.DataAnnotations;

namespace AjaxRomManager.Api.Models
{
    public class StartScanRequest
    {
        [Required]
        public string DirectoryPath { get; set; } = string.Empty;
        
        public int? PlatformId { get; set; }
        
        public ScanOptions? Options { get; set; }
        
        public string? Name { get; set; }
    }
    
    public class RecurringScanRequest
    {
        [Required]
        public string DirectoryPath { get; set; } = string.Empty;
        
        [Required]
        public string CronExpression { get; set; } = string.Empty;
        
        public int? PlatformId { get; set; }
        
        public ScanOptions? Options { get; set; }
        
        public string? Name { get; set; }
    }
    
    public class SetDirectoryRequest
    {
        [Required]
        public string DirectoryPath { get; set; } = string.Empty;
    }
    
    public class ScanHistoryRequest
    {
        public int? PlatformId { get; set; }
        
        public int Page { get; set; } = 1;
        
        public int PageSize { get; set; } = 20;
        
        public string? Status { get; set; }
        
        public DateTime? FromDate { get; set; }
        
        public DateTime? ToDate { get; set; }
    }
    
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        
        public int TotalCount { get; set; }
        
        public int Page { get; set; }
        
        public int PageSize { get; set; }
        
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        
        public bool HasNextPage => Page < TotalPages;
        
        public bool HasPreviousPage => Page > 1;
    }
}
