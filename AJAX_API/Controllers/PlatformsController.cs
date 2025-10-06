using Microsoft.AspNetCore.Mvc;
using AjaxRomManager.Api.Models;
using AjaxRomManager.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace AJAX_API.Controllers
{
    /// <summary>
    /// Controller for managing gaming platforms/systems
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PlatformsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PlatformsController> _logger;

        public PlatformsController(ApplicationDbContext context, ILogger<PlatformsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves all platforms
        /// </summary>
        /// <returns>List of all platforms</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Platform>>> GetPlatforms()
        {
            try
            {
                var platforms = await _context.Platforms
                    .OrderBy(p => p.Name)
                    .ToListAsync();

                return Ok(platforms);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving platforms");
                return StatusCode(500, "An error occurred while retrieving platforms");
            }
        }

        /// <summary>
        /// Retrieves platforms with optional filtering
        /// </summary>
        /// <param name="searchTerm">Search term for platform name</param>
        /// <param name="isActive">Filter by active status</param>
        /// <returns>Filtered list of platforms</returns>
        [HttpGet("filtered")]
        public async Task<ActionResult<IEnumerable<Platform>>> GetFilteredPlatforms(
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? isActive = null)
        {
            try
            {
                var query = _context.Platforms.AsQueryable();

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    query = query.Where(p => p.Name.Contains(searchTerm) || 
                                           (p.Description != null && p.Description.Contains(searchTerm)));
                }

                if (isActive.HasValue)
                {
                    query = query.Where(p => p.IsActive == isActive.Value);
                }

                var platforms = await query.OrderBy(p => p.Name).ToListAsync();
                return Ok(platforms);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving filtered platforms");
                return StatusCode(500, "An error occurred while retrieving platforms");
            }
        }

        /// <summary>
        /// Retrieves a specific platform by ID
        /// </summary>
        /// <param name="id">The platform ID</param>
        /// <returns>The platform with the specified ID</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Platform>> GetPlatform(int id)
        {
            try
            {
                var platform = await _context.Platforms
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (platform == null)
                {
                    return NotFound($"Platform with ID {id} not found");
                }

                return Ok(platform);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving platform {PlatformId}", id);
                return StatusCode(500, "An error occurred while retrieving the platform");
            }
        }

        /// <summary>
        /// Creates a new platform
        /// </summary>
        /// <param name="platform">The platform data to create</param>
        /// <returns>The created platform</returns>
        [HttpPost]
        public async Task<ActionResult<Platform>> CreatePlatform([FromBody] Platform platform)
        {
            try
            {
                if (platform == null)
                {
                    return BadRequest("Platform data is required");
                }

                // Check if platform name already exists
                var existingPlatform = await _context.Platforms
                    .FirstOrDefaultAsync(p => p.Name == platform.Name);

                if (existingPlatform != null)
                {
                    return Conflict($"A platform with the name '{platform.Name}' already exists");
                }

                platform.CreatedAt = DateTime.UtcNow;
                _context.Platforms.Add(platform);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created platform {PlatformId} with name {PlatformName}", 
                    platform.Id, platform.Name);

                return CreatedAtAction(nameof(GetPlatform), new { id = platform.Id }, platform);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating platform");
                return StatusCode(500, "An error occurred while creating the platform");
            }
        }

        /// <summary>
        /// Updates an existing platform
        /// </summary>
        /// <param name="id">The platform ID</param>
        /// <param name="platform">The updated platform data</param>
        /// <returns>The updated platform</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<Platform>> UpdatePlatform(int id, [FromBody] Platform platform)
        {
            try
            {
                if (platform == null)
                {
                    return BadRequest("Platform data is required");
                }

                var existingPlatform = await _context.Platforms.FindAsync(id);
                if (existingPlatform == null)
                {
                    return NotFound($"Platform with ID {id} not found");
                }

                // Check if another platform with the same name exists (excluding current one)
                var duplicatePlatform = await _context.Platforms
                    .FirstOrDefaultAsync(p => p.Name == platform.Name && p.Id != id);

                if (duplicatePlatform != null)
                {
                    return Conflict($"A platform with the name '{platform.Name}' already exists");
                }

                // Update properties
                existingPlatform.Name = platform.Name;
                existingPlatform.Description = platform.Description;
                existingPlatform.Extension = platform.Extension;
                existingPlatform.Extensions = platform.Extensions;
                existingPlatform.EmulatorPath = platform.EmulatorPath;
                existingPlatform.EmulatorArguments = platform.EmulatorArguments;
                existingPlatform.IconPath = platform.IconPath;
                existingPlatform.IsActive = platform.IsActive;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated platform {PlatformId}", id);
                return Ok(existingPlatform);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating platform {PlatformId}", id);
                return StatusCode(500, "An error occurred while updating the platform");
            }
        }

        /// <summary>
        /// Deletes a platform
        /// </summary>
        /// <param name="id">The platform ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePlatform(int id)
        {
            try
            {
                var platform = await _context.Platforms.FindAsync(id);
                if (platform == null)
                {
                    return NotFound($"Platform with ID {id} not found");
                }

                // Check if platform has associated ROMs
                var romCount = await _context.Roms.CountAsync(r => r.PlatformId == id);
                if (romCount > 0)
                {
                    return BadRequest($"Cannot delete platform '{platform.Name}' because it has {romCount} associated ROM(s). Please remove or reassign the ROMs first.");
                }

                _context.Platforms.Remove(platform);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted platform {PlatformId} with name {PlatformName}", 
                    id, platform.Name);

                return Ok(new { message = "Platform deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting platform {PlatformId}", id);
                return StatusCode(500, "An error occurred while deleting the platform");
            }
        }

        /// <summary>
        /// Toggles the active status of a platform
        /// </summary>
        /// <param name="id">The platform ID</param>
        /// <returns>The updated platform</returns>
        [HttpPut("{id}/toggle-active")]
        public async Task<ActionResult<Platform>> ToggleActiveStatus(int id)
        {
            try
            {
                var platform = await _context.Platforms.FindAsync(id);
                if (platform == null)
                {
                    return NotFound($"Platform with ID {id} not found");
                }

                platform.IsActive = !platform.IsActive;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Toggled active status for platform {PlatformId} to {IsActive}", 
                    id, platform.IsActive);

                return Ok(platform);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling active status for platform {PlatformId}", id);
                return StatusCode(500, "An error occurred while updating the platform status");
            }
        }

        /// <summary>
        /// Gets platforms with ROM counts
        /// </summary>
        /// <returns>List of platforms with ROM counts</returns>
        [HttpGet("with-counts")]
        public async Task<ActionResult<IEnumerable<object>>> GetPlatformsWithRomCounts()
        {
            try
            {
                var platformsWithCounts = await _context.Platforms
                    .Select(p => new
                    {
                        p.Id,
                        p.Name,
                        p.Description,
                        p.Extension,
                        p.Extensions,
                        p.EmulatorPath,
                        p.EmulatorArguments,
                        p.IconPath,
                        p.IsActive,
                        p.CreatedAt,
                        RomCount = p.Roms.Count()
                    })
                    .OrderBy(p => p.Name)
                    .ToListAsync();

                return Ok(platformsWithCounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving platforms with ROM counts");
                return StatusCode(500, "An error occurred while retrieving platforms");
            }
        }

        /// <summary>
        /// Gets only active platforms
        /// </summary>
        /// <returns>List of active platforms</returns>
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<Platform>>> GetActivePlatforms()
        {
            try
            {
                var activePlatforms = await _context.Platforms
                    .Where(p => p.IsActive)
                    .OrderBy(p => p.Name)
                    .ToListAsync();

                return Ok(activePlatforms);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active platforms");
                return StatusCode(500, "An error occurred while retrieving active platforms");
            }
        }

        /// <summary>
        /// Searches platforms by name
        /// </summary>
        /// <param name="searchTerm">The search term</param>
        /// <returns>Matching platforms</returns>
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Platform>>> SearchPlatforms([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrEmpty(searchTerm))
                {
                    return BadRequest("Search term is required");
                }

                var platforms = await _context.Platforms
                    .Where(p => p.Name.Contains(searchTerm) || 
                               (p.Description != null && p.Description.Contains(searchTerm)))
                    .OrderBy(p => p.Name)
                    .ToListAsync();

                return Ok(platforms);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching platforms with term {SearchTerm}", searchTerm);
                return StatusCode(500, "An error occurred while searching platforms");
            }
        }

        /// <summary>
        /// Gets platform statistics
        /// </summary>
        /// <returns>Platform statistics</returns>
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetPlatformStatistics()
        {
            try
            {
                var totalPlatforms = await _context.Platforms.CountAsync();
                var activePlatforms = await _context.Platforms.CountAsync(p => p.IsActive);
                var inactivePlatforms = totalPlatforms - activePlatforms;
                var totalRoms = await _context.Roms.CountAsync();

                var statistics = new
                {
                    TotalPlatforms = totalPlatforms,
                    ActivePlatforms = activePlatforms,
                    InactivePlatforms = inactivePlatforms,
                    TotalRoms = totalRoms,
                    AverageRomsPerPlatform = totalPlatforms > 0 ? Math.Round((double)totalRoms / totalPlatforms, 2) : 0
                };

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving platform statistics");
                return StatusCode(500, "An error occurred while retrieving platform statistics");
            }
        }
    }
}
