using Microsoft.AspNetCore.Mvc;
using AjaxRomManager.Api.Models;
using AJAX_API.Services;

namespace AjaxRomManager.Api.Controllers
{
    /// <summary>
    /// Controller for managing system settings and configuration
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class SystemSettingsController : ControllerBase
    {
        private readonly ISystemSettingsService _systemSettingsService;
        private readonly ILogger<SystemSettingsController> _logger;

        public SystemSettingsController(ISystemSettingsService systemSettingsService, ILogger<SystemSettingsController> logger)
        {
            _systemSettingsService = systemSettingsService;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves all system settings
        /// </summary>
        /// <returns>List of all system settings</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SystemSettings>>> GetAllSettings()
        {
            try
            {
                // This would need to be implemented in the service to get all settings
                // For now, we'll return the scan configuration as a structured response
                var scanConfig = await _systemSettingsService.GetScanConfigurationAsync();
                return Ok(scanConfig);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system settings");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves a specific setting by key
        /// </summary>
        /// <param name="key">The setting key</param>
        /// <returns>The setting value</returns>
        [HttpGet("{key}")]
        public async Task<ActionResult<string>> GetSetting(string key)
        {
            try
            {
                var value = await _systemSettingsService.GetSettingAsync(key);
                if (value == null)
                {
                    return NotFound($"Setting with key '{key}' not found");
                }
                return Ok(value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving setting with key {Key}", key);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Creates or updates a system setting
        /// </summary>
        /// <param name="key">The setting key</param>
        /// <param name="request">The setting value and metadata</param>
        /// <returns>The updated setting</returns>
        [HttpPost("{key}")]
        public async Task<ActionResult> SetSetting(string key, [FromBody] SetSettingRequest request)
        {
            try
            {
                await _systemSettingsService.SetSettingAsync(key, request.Value, request.Category, request.Description);
                return Ok(new { message = "Setting updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting value for key {Key}", key);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Deletes a system setting
        /// </summary>
        /// <param name="key">The setting key</param>
        /// <returns>Success response</returns>
        [HttpDelete("{key}")]
        public async Task<ActionResult> DeleteSetting(string key)
        {
            try
            {
                await _systemSettingsService.DeleteSettingAsync(key);
                return Ok(new { message = "Setting deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting setting with key {Key}", key);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves scan configuration settings
        /// </summary>
        /// <returns>Scan configuration</returns>
        [HttpGet("scan/configuration")]
        public async Task<ActionResult<ScanConfiguration>> GetScanConfiguration()
        {
            try
            {
                var config = await _systemSettingsService.GetScanConfigurationAsync();
                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scan configuration");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates scan configuration settings
        /// </summary>
        /// <param name="config">The scan configuration to update</param>
        /// <returns>Success response</returns>
        [HttpPut("scan/configuration")]
        public async Task<ActionResult> UpdateScanConfiguration([FromBody] ScanConfiguration config)
        {
            try
            {
                await _systemSettingsService.UpdateScanConfigurationAsync(config);
                return Ok(new { message = "Scan configuration updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating scan configuration");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves the current scan directory
        /// </summary>
        /// <returns>The scan directory path</returns>
        [HttpGet("scan/directory")]
        public async Task<ActionResult<string>> GetScanDirectory()
        {
            try
            {
                var directory = await _systemSettingsService.GetScanDirectoryAsync();
                return Ok(directory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scan directory");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Sets the scan directory
        /// </summary>
        /// <param name="request">The directory path</param>
        /// <returns>Success response</returns>
        [HttpPut("scan/directory")]
        public async Task<ActionResult> SetScanDirectory([FromBody] SetDirectoryRequest request)
        {
            try
            {
                await _systemSettingsService.SetScanDirectoryAsync(request.DirectoryPath);
                return Ok(new { message = "Scan directory updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting scan directory");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Checks if a setting exists
        /// </summary>
        /// <param name="key">The setting key</param>
        /// <returns>Boolean indicating if the setting exists</returns>
        [HttpGet("{key}/exists")]
        public async Task<ActionResult<bool>> SettingExists(string key)
        {
            try
            {
                var exists = await _systemSettingsService.SettingExistsAsync(key);
                return Ok(exists);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if setting exists for key {Key}", key);
                return StatusCode(500, "Internal server error");
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
