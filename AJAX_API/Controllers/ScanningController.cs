using Microsoft.AspNetCore.Mvc;
using AjaxRomManager.Api.Models;
using AjaxRomManager.Api.Services;
using AJAX_API.Services;

namespace AJAX_API.Controllers
{
    /// <summary>
    /// Controller for managing file scanning operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ScanningController : ControllerBase
    {
        private readonly IFileScanningService _scanningService;
        private readonly ISystemSettingsService _settingsService;
        private readonly ILogger<ScanningController> _logger;

        public ScanningController(IFileScanningService scanningService, ISystemSettingsService settingsService, ILogger<ScanningController> logger)
        {
            _scanningService = scanningService;
            _settingsService = settingsService;
            _logger = logger;
        }

        /// <summary>
        /// Starts a new scan job for the specified directory
        /// </summary>
        /// <param name="request">Scan request parameters</param>
        /// <returns>The created scan job</returns>
        [HttpPost("start")]
        public async Task<ActionResult<ScanJob>> StartScan([FromBody] StartScanRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.DirectoryPath))
                {
                    return BadRequest("Directory path is required");
                }

                var scanJob = await _scanningService.StartScanAsync(
                    request.DirectoryPath, 
                    request.PlatformId, 
                    request.Options);

                _logger.LogInformation("Started scan job {ScanJobId} for directory {DirectoryPath}", 
                    scanJob.Id, request.DirectoryPath);

                return CreatedAtAction(nameof(GetScanJob), new { id = scanJob.Id }, scanJob);
            }
            catch (DirectoryNotFoundException ex)
            {
                _logger.LogWarning(ex, "Directory not found: {DirectoryPath}", request.DirectoryPath);
                return NotFound($"Directory not found: {request.DirectoryPath}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting scan for directory {DirectoryPath}", request.DirectoryPath);
                return StatusCode(500, "An error occurred while starting the scan");
            }
        }

        /// <summary>
        /// Starts a recurring scan job with the specified cron expression
        /// </summary>
        /// <param name="request">Recurring scan request parameters</param>
        /// <returns>The created recurring scan job</returns>
        [HttpPost("start-recurring")]
        public async Task<ActionResult<ScanJob>> StartRecurringScan([FromBody] RecurringScanRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.DirectoryPath))
                {
                    return BadRequest("Directory path is required");
                }

                if (string.IsNullOrEmpty(request.CronExpression))
                {
                    return BadRequest("Cron expression is required");
                }

                var scanJob = await _scanningService.StartRecurringScanAsync(
                    request.DirectoryPath, 
                    request.CronExpression, 
                    request.PlatformId);

                _logger.LogInformation("Started recurring scan job {ScanJobId} for directory {DirectoryPath}", 
                    scanJob.Id, request.DirectoryPath);

                return CreatedAtAction(nameof(GetScanJob), new { id = scanJob.Id }, scanJob);
            }
            catch (DirectoryNotFoundException ex)
            {
                _logger.LogWarning(ex, "Directory not found: {DirectoryPath}", request.DirectoryPath);
                return NotFound($"Directory not found: {request.DirectoryPath}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting recurring scan for directory {DirectoryPath}", request.DirectoryPath);
                return StatusCode(500, "An error occurred while starting the recurring scan");
            }
        }

        /// <summary>
        /// Stops a running scan job
        /// </summary>
        /// <param name="id">The scan job ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> StopScan(int id)
        {
            try
            {
                var stopped = await _scanningService.StopScanAsync(id);
                if (!stopped)
                {
                    return NotFound($"Scan job {id} not found or not running");
                }

                _logger.LogInformation("Stopped scan job {ScanJobId}", id);
                return Ok(new { message = "Scan job stopped successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping scan job {ScanJobId}", id);
                return StatusCode(500, "An error occurred while stopping the scan");
            }
        }

        /// <summary>
        /// Gets a specific scan job by ID
        /// </summary>
        /// <param name="id">The scan job ID</param>
        /// <returns>The scan job details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ScanJob>> GetScanJob(int id)
        {
            try
            {
                var scanJob = await _scanningService.GetScanJobAsync(id);
                if (scanJob == null)
                {
                    return NotFound($"Scan job {id} not found");
                }

                return Ok(scanJob);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scan job {ScanJobId}", id);
                return StatusCode(500, "An error occurred while retrieving the scan job");
            }
        }

        /// <summary>
        /// Gets all currently active scan jobs
        /// </summary>
        /// <returns>List of active scan jobs</returns>
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<ScanJob>>> GetActiveScans()
        {
            try
            {
                var activeScans = await _scanningService.GetActiveScansAsync();
                return Ok(activeScans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active scans");
                return StatusCode(500, "An error occurred while retrieving active scans");
            }
        }

        /// <summary>
        /// Gets scan job history with optional filtering
        /// </summary>
        /// <param name="request">History request parameters</param>
        /// <returns>Paginated scan job history</returns>
        [HttpGet("history")]
        public async Task<ActionResult<PagedResult<ScanJob>>> GetScanHistory([FromQuery] ScanHistoryRequest request)
        {
            try
            {
                var history = await _scanningService.GetScanHistoryAsync(
                    request.PlatformId,
                    request.Page,
                    request.PageSize,
                    request.Status,
                    request.FromDate,
                    request.ToDate);

                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scan history");
                return StatusCode(500, "An error occurred while retrieving scan history");
            }
        }

        /// <summary>
        /// Gets the current progress of a scan job
        /// </summary>
        /// <param name="id">The scan job ID</param>
        /// <returns>Current scan progress</returns>
        [HttpGet("{id}/progress")]
        public async Task<ActionResult<ScanProgress>> GetScanProgress(int id)
        {
            try
            {
                var progress = await _scanningService.GetScanProgressAsync(id);
                return Ok(progress);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Scan job {ScanJobId} not found", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scan progress for job {ScanJobId}", id);
                return StatusCode(500, "An error occurred while retrieving scan progress");
            }
        }

        /// <summary>
        /// Gets the current scan configuration settings
        /// </summary>
        /// <returns>Current scan configuration</returns>
        [HttpGet("settings")]
        public async Task<ActionResult<ScanConfiguration>> GetScanSettings()
        {
            try
            {
                var config = await _settingsService.GetScanConfigurationAsync();
                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scan settings");
                return StatusCode(500, "An error occurred while retrieving scan settings");
            }
        }

        /// <summary>
        /// Updates the scan configuration settings
        /// </summary>
        /// <param name="config">New scan configuration</param>
        /// <returns>Success status</returns>
        [HttpPut("settings")]
        public async Task<ActionResult> UpdateScanSettings([FromBody] ScanConfiguration config)
        {
            try
            {
                if (config == null)
                {
                    return BadRequest("Configuration is required");
                }

                await _settingsService.UpdateScanConfigurationAsync(config);
                
                _logger.LogInformation("Updated scan configuration");
                return Ok(new { message = "Scan configuration updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating scan settings");
                return StatusCode(500, "An error occurred while updating scan settings");
            }
        }

        /// <summary>
        /// Gets the current default scan directory
        /// </summary>
        /// <returns>Current scan directory path</returns>
        [HttpGet("directory")]
        public async Task<ActionResult<string>> GetScanDirectory()
        {
            try
            {
                var directory = await _settingsService.GetScanDirectoryAsync();
                return Ok(directory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scan directory");
                return StatusCode(500, "An error occurred while retrieving scan directory");
            }
        }

        /// <summary>
        /// Sets the default scan directory
        /// </summary>
        /// <param name="request">Directory path request</param>
        /// <returns>Success status</returns>
        [HttpPut("directory")]
        public async Task<ActionResult> SetScanDirectory([FromBody] SetDirectoryRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.DirectoryPath))
                {
                    return BadRequest("Directory path is required");
                }

                if (!Directory.Exists(request.DirectoryPath))
                {
                    return BadRequest($"Directory does not exist: {request.DirectoryPath}");
                }

                await _settingsService.SetScanDirectoryAsync(request.DirectoryPath);
                
                _logger.LogInformation("Updated scan directory to {DirectoryPath}", request.DirectoryPath);
                return Ok(new { message = "Scan directory updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting scan directory to {DirectoryPath}", request.DirectoryPath);
                return StatusCode(500, "An error occurred while setting scan directory");
            }
        }

        /// <summary>
        /// Cancels a scan job
        /// </summary>
        /// <param name="id">The scan job ID</param>
        /// <returns>Success status</returns>
        [HttpPut("{id}/cancel")]
        public async Task<ActionResult> CancelScan(int id)
        {
            try
            {
                var cancelled = await _scanningService.CancelScanAsync(id);
                if (!cancelled)
                {
                    return NotFound($"Scan job {id} not found or not cancellable");
                }

                _logger.LogInformation("Cancelled scan job {ScanJobId}", id);
                return Ok(new { message = "Scan job cancelled successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling scan job {ScanJobId}", id);
                return StatusCode(500, "An error occurred while cancelling the scan");
            }
        }

        /// <summary>
        /// Retries a failed scan job
        /// </summary>
        /// <param name="id">The scan job ID</param>
        /// <returns>The retried scan job</returns>
        [HttpPost("{id}/retry")]
        public async Task<ActionResult<ScanJob>> RetryScan(int id)
        {
            try
            {
                var retryJob = await _scanningService.RetryScanAsync(id);
                if (retryJob == null)
                {
                    return NotFound($"Scan job {id} not found or not retryable");
                }

                _logger.LogInformation("Retried scan job {OriginalScanJobId} as {NewScanJobId}", id, retryJob.Id);
                return Ok(retryJob);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrying scan job {ScanJobId}", id);
                return StatusCode(500, "An error occurred while retrying the scan");
            }
        }

        /// <summary>
        /// Deletes a scan job permanently
        /// </summary>
        /// <param name="id">The scan job ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}/delete")]
        public async Task<ActionResult> DeleteScanJob(int id)
        {
            try
            {
                var deleted = await _scanningService.DeleteScanJobAsync(id);
                if (!deleted)
                {
                    return NotFound($"Scan job {id} not found");
                }

                _logger.LogInformation("Deleted scan job {ScanJobId}", id);
                return Ok(new { message = "Scan job deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting scan job {ScanJobId}", id);
                return StatusCode(500, "An error occurred while deleting the scan job");
            }
        }

        /// <summary>
        /// Gets scan logs for a specific scan job
        /// </summary>
        /// <param name="id">The scan job ID</param>
        /// <returns>List of log messages</returns>
        [HttpGet("{id}/logs")]
        public async Task<ActionResult<IEnumerable<string>>> GetScanLogs(int id)
        {
            try
            {
                var logs = await _scanningService.GetScanLogsAsync(id);
                return Ok(logs);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Scan job {ScanJobId} not found", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scan logs for job {ScanJobId}", id);
                return StatusCode(500, "An error occurred while retrieving scan logs");
            }
        }

        /// <summary>
        /// Gets scan statistics
        /// </summary>
        /// <returns>Scan statistics</returns>
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetScanStatistics()
        {
            try
            {
                var stats = await _scanningService.GetScanStatisticsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scan statistics");
                return StatusCode(500, "An error occurred while retrieving scan statistics");
            }
        }
    }
}
