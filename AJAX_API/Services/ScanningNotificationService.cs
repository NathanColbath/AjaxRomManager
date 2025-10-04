using Microsoft.AspNetCore.SignalR;
using AJAX_API.Hubs;
using AjaxRomManager.Api.Models;

namespace AJAX_API.Services
{
    public interface IScanningNotificationService
    {
        Task NotifyScanStartedAsync(int scanJobId, ScanJob scanJob);
        Task NotifyScanProgressAsync(int scanJobId, ScanProgress progress);
        Task NotifyScanCompletedAsync(int scanJobId, ScanJob scanJob);
        Task NotifyScanFailedAsync(int scanJobId, ScanJob scanJob, string errorMessage);
        Task NotifyScanCancelledAsync(int scanJobId, ScanJob scanJob);
        Task NotifyScanJobCreatedAsync(ScanJob scanJob);
    }

    public class ScanningNotificationService : IScanningNotificationService
    {
        private readonly IHubContext<ScanningHub> _hubContext;
        private readonly ILogger<ScanningNotificationService> _logger;

        public ScanningNotificationService(IHubContext<ScanningHub> hubContext, ILogger<ScanningNotificationService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task NotifyScanStartedAsync(int scanJobId, ScanJob scanJob)
        {
            try
            {
                var message = new
                {
                    ScanJobId = scanJobId,
                    Status = "Started",
                    Message = $"Scan started for directory: {scanJob.ScanPath}",
                    Timestamp = DateTime.UtcNow,
                    ScanJob = scanJob
                };

                await _hubContext.Clients.Group($"Scan_{scanJobId}").SendAsync("ScanStarted", message);
                await _hubContext.Clients.Group("AllScans").SendAsync("ScanStarted", message);
                
                _logger.LogDebug("Sent scan started notification for scan job {ScanJobId}", scanJobId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending scan started notification for scan job {ScanJobId}", scanJobId);
            }
        }

        public async Task NotifyScanProgressAsync(int scanJobId, ScanProgress progress)
        {
            try
            {
                var message = new
                {
                    ScanJobId = scanJobId,
                    Status = "Progress",
                    Progress = progress,
                    Timestamp = DateTime.UtcNow
                };

                await _hubContext.Clients.Group($"Scan_{scanJobId}").SendAsync("ScanProgress", message);
                await _hubContext.Clients.Group("AllScans").SendAsync("ScanProgress", message);
                
                _logger.LogDebug("Sent scan progress notification for scan job {ScanJobId}: {Progress}%", scanJobId, progress.Progress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending scan progress notification for scan job {ScanJobId}", scanJobId);
            }
        }

        public async Task NotifyScanCompletedAsync(int scanJobId, ScanJob scanJob)
        {
            try
            {
                var message = new
                {
                    ScanJobId = scanJobId,
                    Status = "Completed",
                    Message = $"Scan completed: {scanJob.FilesFound} files found, {scanJob.FilesProcessed} processed, {scanJob.Errors} errors",
                    Timestamp = DateTime.UtcNow,
                    ScanJob = scanJob
                };

                await _hubContext.Clients.Group($"Scan_{scanJobId}").SendAsync("ScanCompleted", message);
                await _hubContext.Clients.Group("AllScans").SendAsync("ScanCompleted", message);
                
                _logger.LogDebug("Sent scan completed notification for scan job {ScanJobId}", scanJobId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending scan completed notification for scan job {ScanJobId}", scanJobId);
            }
        }

        public async Task NotifyScanFailedAsync(int scanJobId, ScanJob scanJob, string errorMessage)
        {
            try
            {
                var message = new
                {
                    ScanJobId = scanJobId,
                    Status = "Failed",
                    Message = $"Scan failed: {errorMessage}",
                    Timestamp = DateTime.UtcNow,
                    ScanJob = scanJob,
                    ErrorMessage = errorMessage
                };

                await _hubContext.Clients.Group($"Scan_{scanJobId}").SendAsync("ScanFailed", message);
                await _hubContext.Clients.Group("AllScans").SendAsync("ScanFailed", message);
                
                _logger.LogDebug("Sent scan failed notification for scan job {ScanJobId}", scanJobId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending scan failed notification for scan job {ScanJobId}", scanJobId);
            }
        }

        public async Task NotifyScanCancelledAsync(int scanJobId, ScanJob scanJob)
        {
            try
            {
                var message = new
                {
                    ScanJobId = scanJobId,
                    Status = "Cancelled",
                    Message = "Scan was cancelled",
                    Timestamp = DateTime.UtcNow,
                    ScanJob = scanJob
                };

                await _hubContext.Clients.Group($"Scan_{scanJobId}").SendAsync("ScanCancelled", message);
                await _hubContext.Clients.Group("AllScans").SendAsync("ScanCancelled", message);
                
                _logger.LogDebug("Sent scan cancelled notification for scan job {ScanJobId}", scanJobId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending scan cancelled notification for scan job {ScanJobId}", scanJobId);
            }
        }

        public async Task NotifyScanJobCreatedAsync(ScanJob scanJob)
        {
            try
            {
                var message = new
                {
                    ScanJobId = scanJob.Id,
                    Status = "Created",
                    Message = $"New scan job created: {scanJob.Name}",
                    Timestamp = DateTime.UtcNow,
                    ScanJob = scanJob
                };

                await _hubContext.Clients.Group("AllScans").SendAsync("ScanJobCreated", message);
                
                _logger.LogDebug("Sent scan job created notification for scan job {ScanJobId}", scanJob.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending scan job created notification for scan job {ScanJobId}", scanJob.Id);
            }
        }
    }
}
