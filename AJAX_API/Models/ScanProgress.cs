using System.ComponentModel.DataAnnotations;

namespace AjaxRomManager.Api.Models
{
    public class ScanProgress
    {
        public int ScanJobId { get; set; }
        
        public string Status { get; set; } = string.Empty;
        
        public decimal Progress { get; set; }
        
        public int FilesFound { get; set; }
        
        public int FilesProcessed { get; set; }
        
        public int FilesAdded { get; set; }
        
        public int FilesSkipped { get; set; }
        
        public int Errors { get; set; }
        
        public string? CurrentFile { get; set; }
        
        public DateTime? StartedAt { get; set; }
        
        public DateTime? EstimatedCompletion { get; set; }
        
        public List<string> ErrorMessages { get; set; } = new();
        
        public TimeSpan? ElapsedTime { get; set; }
        
        public TimeSpan? RemainingTime { get; set; }
    }
}
