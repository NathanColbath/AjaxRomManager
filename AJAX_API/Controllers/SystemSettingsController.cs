using Microsoft.AspNetCore.Mvc;
using AjaxRomManager.Api.Models;
using AJAX_API.Services;

namespace AJAX_API.Controllers
{
    /// <summary>
    /// Controller for managing system settings
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class SystemSettingsController : ControllerBase
    {
        private readonly ISystemSettingsService _settingsService;
        private readonly ILogger<SystemSettingsController> _logger;

        public SystemSettingsController(ISystemSettingsService settingsService, ILogger<SystemSettingsController> logger)
        {
            _settingsService = settingsService;
            _logger = logger;
        }

        /// <summary>
        /// Gets a system setting by key
        /// </summary>
        /// <param name="key">The setting key</param>
        /// <returns>The setting value</returns>
        [HttpGet("{key}")]
        public async Task<ActionResult<string>> GetSetting(string key)
        {
            try
            {
                var value = await _settingsService.GetSettingAsync(key);
                if (value == null)
                {
                    return NotFound($"Setting '{key}' not found");
                }

                return Ok(value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving setting {Key}", key);
                return StatusCode(500, "An error occurred while retrieving the setting");
            }
        }

        /// <summary>
        /// Sets a system setting
        /// </summary>
        /// <param name="key">The setting key</param>
        /// <param name="request">The setting value and metadata</param>
        /// <returns>Success status</returns>
        [HttpPut("{key}")]
        public async Task<ActionResult> SetSetting(string key, [FromBody] SetSettingRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Value))
                {
                    return BadRequest("Setting value is required");
                }

                await _settingsService.SetSettingAsync(key, request.Value, request.Category, request.Description);
                
                _logger.LogInformation("Updated setting {Key}", key);
                return Ok(new { message = "Setting updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting {Key}", key);
                return StatusCode(500, "An error occurred while setting the value");
            }
        }

        /// <summary>
        /// Deletes a system setting
        /// </summary>
        /// <param name="key">The setting key</param>
        /// <returns>Success status</returns>
        [HttpDelete("{key}")]
        public async Task<ActionResult> DeleteSetting(string key)
        {
            try
            {
                var exists = await _settingsService.SettingExistsAsync(key);
                if (!exists)
                {
                    return NotFound($"Setting '{key}' not found");
                }

                await _settingsService.DeleteSettingAsync(key);
                
                _logger.LogInformation("Deleted setting {Key}", key);
                return Ok(new { message = "Setting deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting setting {Key}", key);
                return StatusCode(500, "An error occurred while deleting the setting");
            }
        }

        /// <summary>
        /// Gets scan configuration settings
        /// </summary>
        /// <returns>Current scan configuration</returns>
        [HttpGet("scan/configuration")]
        public async Task<ActionResult<ScanConfiguration>> GetScanConfiguration()
        {
            try
            {
                var config = await _settingsService.GetScanConfigurationAsync();
                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scan configuration");
                return StatusCode(500, "An error occurred while retrieving scan configuration");
            }
        }

        /// <summary>
        /// Updates scan configuration settings
        /// </summary>
        /// <param name="config">New scan configuration</param>
        /// <returns>Success status</returns>
        [HttpPut("scan/configuration")]
        public async Task<ActionResult> UpdateScanConfiguration([FromBody] ScanConfiguration config)
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
                _logger.LogError(ex, "Error updating scan configuration");
                return StatusCode(500, "An error occurred while updating scan configuration");
            }
        }

        /// <summary>
        /// Gets the current default scan directory
        /// </summary>
        /// <returns>Current scan directory path</returns>
        [HttpGet("scan/directory")]
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
        [HttpPut("scan/directory")]
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
        /// Resets the database and all settings
        /// </summary>
        /// <returns>Success message</returns>
        [HttpPost("reset-database")]
        public async Task<ActionResult> ResetDatabase()
        {
            try
            {
                await _settingsService.ResetDatabaseAsync();
                
                _logger.LogWarning("Database has been reset - all data cleared");
                return Ok(new { message = "Database has been reset successfully. All data has been cleared." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting database");
                return StatusCode(500, "An error occurred while resetting the database");
            }
        }

        /// <summary>
        /// Deletes all local data (images and ROMs)
        /// </summary>
        /// <returns>Success message</returns>
        [HttpPost("delete-local-data")]
        public async Task<ActionResult> DeleteLocalData()
        {
            try
            {
                var deletedFiles = await _settingsService.DeleteLocalDataAsync();
                
                _logger.LogWarning("Local data deleted - {FileCount} files removed", deletedFiles);
                return Ok(new { 
                    message = $"Local data deleted successfully. {deletedFiles} files were removed.",
                    deletedFiles = deletedFiles
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting local data");
                return StatusCode(500, "An error occurred while deleting local data");
            }
        }
    }

    /// <summary>
    /// Request model for setting a system setting
    /// </summary>
    public class SetSettingRequest
    {
        public string Value { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Description { get; set; }
    }
}