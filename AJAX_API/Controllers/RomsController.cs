using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AjaxRomManager.Api.Data;
using AjaxRomManager.Api.Models;
using Microsoft.AspNetCore.Mvc;
using AJAX_API.Services;
using AJAX_API.Constants;
using System.Security.Cryptography;

namespace AJAX_API.Controllers
{
    /// <summary>
    /// Controller for managing ROM files and their operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class RomsController : ControllerBase
    {
       
       private readonly IRomsManagmentService _romsManagmentService;
       private readonly ISystemSettingsService _settingsService;
       private readonly ILogger<RomsController> _logger;
       
       public RomsController(IRomsManagmentService romsManagmentService, ISystemSettingsService settingsService, ILogger<RomsController> logger)
       {
        _romsManagmentService = romsManagmentService;
        _settingsService = settingsService;
        _logger = logger;
       }

       /// <summary>
       /// Gets the working ROM directory from settings
       /// </summary>
       /// <returns>The working ROM directory path</returns>
       private async Task<string> GetWorkingRomDirectory()
       {
           var workingDir = await _settingsService.GetSettingAsync(SystemSettingsConstants.SCAN_DEFAULT_DIRECTORY);
           if (string.IsNullOrEmpty(workingDir))
           {
               // Fallback to default directory if setting not found
               workingDir = SystemSettingsConstants.DefaultValues.DEFAULT_SCAN_DIRECTORY;
           }
           
           // Ensure the path is absolute
           if (!Path.IsPathRooted(workingDir))
           {
               workingDir = Path.GetFullPath(workingDir);
           }
           
           return workingDir;
       }

       /// <summary>
       /// Creates a platform-specific directory name
       /// </summary>
       /// <param name="platformId">Platform ID</param>
       /// <param name="platformName">Platform name</param>
       /// <returns>Directory name in format "id - platform_name"</returns>
       private string CreatePlatformDirectoryName(int platformId, string platformName)
       {
           // Sanitize platform name for directory use
           var sanitizedName = platformName
               .Replace(" ", "_")
               .Replace("-", "_")
               .Replace("(", "")
               .Replace(")", "")
               .Replace("[", "")
               .Replace("]", "")
               .Replace("&", "and")
               .ToLowerInvariant();
           
           return $"{platformId} - {sanitizedName}";
       }

       /// <summary>
       /// Calculates SHA-256 hash of a file
       /// </summary>
       /// <param name="file">The file to hash</param>
       /// <returns>SHA-256 hash as hexadecimal string</returns>
       private async Task<string> CalculateFileHash(IFormFile file)
       {
           using var sha256 = SHA256.Create();
           using var stream = file.OpenReadStream();
           var hashBytes = await Task.Run(() => sha256.ComputeHash(stream));
           return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
       }

       /// <summary>
       /// Retrieves all ROM files from the collection
       /// </summary>
       /// <returns>List of all ROM files</returns>
       [HttpGet]
       public async Task<ActionResult<IEnumerable<Rom>>> GetRoms()
       {
        var roms = await _romsManagmentService.GetRoms();
        return Ok(roms);
       }

       /// <summary>
       /// Retrieves ROM files with filtering and pagination
       /// </summary>
       /// <param name="platformId">Filter by platform ID</param>
       /// <param name="searchTerm">Search term for title or filename</param>
       /// <param name="isFavorite">Filter by favorite status</param>
       /// <param name="isArchived">Filter by archived status</param>
       /// <param name="genre">Filter by genre</param>
       /// <param name="developer">Filter by developer</param>
       /// <param name="publisher">Filter by publisher</param>
       /// <param name="minRating">Minimum rating filter</param>
       /// <param name="maxRating">Maximum rating filter</param>
       /// <param name="sortBy">Sort field (title, filesize, dateadded, rating)</param>
       /// <param name="sortOrder">Sort order (asc, desc)</param>
       /// <param name="page">Page number</param>
       /// <param name="pageSize">Page size</param>
       /// <returns>Filtered and paginated list of ROM files</returns>
       [HttpGet("filtered")]
       public async Task<ActionResult<PagedResult<Rom>>> GetRomsFiltered(
           [FromQuery] int? platformId = null,
           [FromQuery] string? searchTerm = null,
           [FromQuery] bool? isFavorite = null,
           [FromQuery] bool? isArchived = null,
           [FromQuery] string? genre = null,
           [FromQuery] string? developer = null,
           [FromQuery] string? publisher = null,
           [FromQuery] int? minRating = null,
           [FromQuery] int? maxRating = null,
           [FromQuery] string? sortBy = null,
           [FromQuery] string? sortOrder = null,
           [FromQuery] int page = 1,
           [FromQuery] int pageSize = 20)
       {
           var result = await _romsManagmentService.GetRoms(platformId, searchTerm, isFavorite, isArchived, genre, developer, publisher, minRating, maxRating, sortBy, sortOrder, page, pageSize);
           return Ok(result);
       }

       /// <summary>
       /// Retrieves a specific ROM file by its ID
       /// </summary>
       /// <param name="id">The unique identifier of the ROM file</param>
       /// <returns>The ROM file with the specified ID</returns>
       [HttpGet("{id}")]
       public async Task<ActionResult<Rom>> GetRomById(int id)
       {
        var rom = await _romsManagmentService.GetRomById(id);
        return Ok(rom);
       }

       /// <summary>
       /// Creates a new ROM file entry
       /// </summary>
       /// <param name="rom">The ROM file data to create</param>
       /// <returns>The created ROM file</returns>
       [HttpPost]
       public async Task<ActionResult<Rom>> CreateRom(Rom rom)
       {
        var createdRom = await _romsManagmentService.CreateRom(rom);
        if (createdRom == null)
        {
            return BadRequest("Failed to create ROM");
        }
        return CreatedAtAction(nameof(GetRomById), new { id = createdRom.Id }, createdRom);
       }

       /// <summary>
       /// Uploads a single ROM file
       /// </summary>
       /// <param name="file">The ROM file to upload</param>
       /// <param name="platformId">The platform ID for the ROM</param>
       /// <returns>Upload result with ROM information</returns>
       [HttpPost("upload")]
       public async Task<ActionResult<object>> UploadRom(IFormFile file, [FromForm] int platformId)
       {
           try
           {
               if (file == null || file.Length == 0)
               {
                   return BadRequest(new { success = false, message = "No file provided" });
               }

               // Validate file size (max 2GB)
               if (file.Length > 2L * 1024 * 1024 * 1024)
               {
                   return BadRequest(new { success = false, message = "File size must be less than 2GB" });
               }

               // Get platform information
               var platform = await _romsManagmentService.GetPlatformById(platformId);
               if (platform == null)
               {
                   return BadRequest(new { success = false, message = "Invalid platform ID" });
               }

               // Generate unique filename and path
               var fileExtension = Path.GetExtension(file.FileName);
               var fileName = $"{Guid.NewGuid()}{fileExtension}";
               
               // Get working ROM directory from settings
               var workingRomDir = await GetWorkingRomDirectory();
               var platformDirName = CreatePlatformDirectoryName(platformId, platform.Name);
               var platformPath = Path.Combine(workingRomDir, platformDirName);
               var fullPath = platformPath; // Use the path directly from settings

               // Ensure directory exists
               if (!Directory.Exists(fullPath))
               {
                   Directory.CreateDirectory(fullPath);
               }

               var filePath = Path.Combine(fullPath, fileName);
               var relativePath = Path.Combine(platformPath, fileName).Replace("\\", "/");

               // Calculate file hash
               var fileHash = await CalculateFileHash(file);

               // Save the file
               using (var stream = new FileStream(filePath, FileMode.Create))
               {
                   await file.CopyToAsync(stream);
               }

               // Create ROM entry
               var rom = new Rom
               {
                   Title = Path.GetFileNameWithoutExtension(file.FileName),
                   FilePath = relativePath,
                   FileName = file.FileName,
                   FileSize = file.Length,
                   FileHash = fileHash,
                   PlatformId = platformId,
                   DateAdded = DateTime.UtcNow
               };

               var createdRom = await _romsManagmentService.CreateRom(rom);

               return Ok(new
               {
                   success = true,
                   romId = createdRom?.Id,
                   fileName = file.FileName,
                   platformId = platformId,
                   platformName = platform.Name,
                   filePath = relativePath,
                   message = "ROM uploaded successfully"
               });
           }
           catch (Exception)
           {
               return StatusCode(500, new { success = false, message = "An error occurred while uploading the file" });
           }
       }

       /// <summary>
       /// Uploads multiple ROM files
       /// </summary>
       /// <param name="files">The ROM files to upload</param>
       /// <param name="platformId">The platform ID for the ROMs</param>
       /// <returns>Upload results for all files</returns>
       [HttpPost("upload-multiple")]
       public async Task<ActionResult<object[]>> UploadMultipleRoms(IFormFileCollection files, [FromForm] int platformId)
       {
           try
           {
               Console.WriteLine($"UploadMultipleRoms called with {files?.Count ?? 0} files for platform {platformId}");
               
               if (files == null || files.Count == 0)
               {
                   Console.WriteLine("No files provided");
                   return BadRequest(new[] { new { success = false, message = "No files provided" } });
               }

               // Get platform information
               var platform = await _romsManagmentService.GetPlatformById(platformId);
               if (platform == null)
               {
                   return BadRequest(new[] { new { success = false, message = "Invalid platform ID" } });
               }

               var results = new List<object>();

               foreach (var file in files)
               {
                   try
                   {
                       if (file.Length == 0)
                       {
                           results.Add(new { success = false, fileName = file.FileName, message = "Empty file" });
                           continue;
                       }

                       // Validate file size (max 2GB)
                       if (file.Length > 2L * 1024 * 1024 * 1024)
                       {
                           results.Add(new { success = false, fileName = file.FileName, message = "File size must be less than 2GB" });
                           continue;
                       }

                       // Generate unique filename and path
                       var fileExtension = Path.GetExtension(file.FileName);
                       var fileName = $"{Guid.NewGuid()}{fileExtension}";
                       
                       // Get working ROM directory from settings
                       var workingRomDir = await GetWorkingRomDirectory();
                       var platformDirName = CreatePlatformDirectoryName(platformId, platform.Name);
                       var platformPath = Path.Combine(workingRomDir, platformDirName);
                       var fullPath = platformPath; // Use the path directly from settings

                       // Ensure directory exists
                       if (!Directory.Exists(fullPath))
                       {
                           Directory.CreateDirectory(fullPath);
                       }

                       var filePath = Path.Combine(fullPath, fileName);
                       var relativePath = Path.Combine(platformPath, fileName).Replace("\\", "/");

                       // Calculate file hash
                       var fileHash = await CalculateFileHash(file);

                       // Save the file
                       using (var stream = new FileStream(filePath, FileMode.Create))
                       {
                           await file.CopyToAsync(stream);
                       }

                       // Create ROM entry
                       var rom = new Rom
                       {
                           Title = Path.GetFileNameWithoutExtension(file.FileName),
                           FilePath = relativePath,
                           FileName = file.FileName,
                           FileSize = file.Length,
                           FileHash = fileHash,
                           PlatformId = platformId,
                           DateAdded = DateTime.UtcNow
                       };

                       var createdRom = await _romsManagmentService.CreateRom(rom);

                       results.Add(new
                       {
                           success = true,
                           romId = createdRom?.Id,
                           fileName = file.FileName,
                           platformId = platformId,
                           platformName = platform.Name,
                           filePath = relativePath,
                           message = "ROM uploaded successfully"
                       });
                   }
                   catch (Exception)
                   {
                       results.Add(new { success = false, fileName = file.FileName, message = "Error uploading file" });
                   }
               }

               return Ok(results.ToArray());
           }
           catch (Exception)
           {
               return StatusCode(500, new[] { new { success = false, message = "An error occurred while uploading files" } });
           }
       }

       /// <summary>
       /// Checks if a ROM with the given hash already exists
       /// </summary>
       /// <param name="hash">The file hash to check</param>
       /// <returns>Duplicate check result</returns>
       [HttpGet("check-duplicate")]
       public async Task<ActionResult<object>> CheckDuplicate([FromQuery] string hash)
       {
           try
           {
               if (string.IsNullOrEmpty(hash))
               {
                   return BadRequest(new { isDuplicate = false, message = "Hash parameter is required" });
               }

               var existingRom = await _romsManagmentService.GetRomByHash(hash);
               
               if (existingRom != null)
               {
                   return Ok(new
                   {
                       isDuplicate = true,
                       existingRom = new
                       {
                           id = existingRom.Id,
                           title = existingRom.Title,
                           fileName = existingRom.FileName,
                           fileSize = existingRom.FileSize,
                           platformId = existingRom.PlatformId,
                           platform = existingRom.Platform != null ? new
                           {
                               id = existingRom.Platform.Id,
                               name = existingRom.Platform.Name
                           } : null,
                           dateAdded = existingRom.DateAdded
                       }
                   });
               }

               return Ok(new { isDuplicate = false });
           }
           catch (Exception)
           {
               return StatusCode(500, new { isDuplicate = false, message = "Error checking for duplicates" });
           }
       }
       /// <summary>
       /// Updates an existing ROM file
       /// </summary>
       /// <param name="id">The ID of the ROM file to update</param>
       /// <param name="rom">The updated ROM file data</param>
       /// <returns>The updated ROM file</returns>
       [HttpPut("{id}")]
       public async Task<ActionResult<Rom>> UpdateRom(int id, Rom rom)
       {
        var updatedRom = await _romsManagmentService.UpdateRom(id, rom);
        return Ok(updatedRom);
       }

       /// <summary>
       /// Deletes a ROM file from the collection
       /// </summary>
       /// <param name="id">The ID of the ROM file to delete</param>
       /// <returns>The deleted ROM file</returns>
       [HttpDelete("{id}")]
       public async Task<ActionResult<Rom>> DeleteRom(int id)
       {
        var deletedRom = await _romsManagmentService.DeleteRom(id);
        return Ok(deletedRom);
       }

       /// <summary>
       /// Retrieves metadata for a specific ROM file
       /// </summary>
       /// <param name="id">The ID of the ROM file</param>
       /// <returns>The metadata for the specified ROM file</returns>
       [HttpGet("{id}/metadata")]
       public async Task<ActionResult<RomMetadata>> GetRomMetadata(int id)
       {
        var metadata = await _romsManagmentService.GetRomMetadata(id);
        return Ok(metadata);
       }

       /// <summary>
       /// Downloads a ROM file
       /// </summary>
       /// <param name="id">The ID of the ROM file to download</param>
       /// <returns>The ROM file as a downloadable stream</returns>
       [HttpGet("{id}/download")]
       public async Task<ActionResult> DownloadRom(int id)
       {
           try
           {
               // Get ROM information
               var rom = await _romsManagmentService.GetRomById(id);
               if (rom == null)
               {
                   return NotFound(new { success = false, message = "ROM not found" });
               }

               // Get the full file path
               var workingRomDir = await GetWorkingRomDirectory();
               var fullFilePath = Path.Combine(workingRomDir, rom.FilePath);

               // Check if file exists
               if (!System.IO.File.Exists(fullFilePath))
               {
                   return NotFound(new { success = false, message = "ROM file not found on disk" });
               }

               // Get file info
               var fileInfo = new FileInfo(fullFilePath);
               var fileName = rom.FileName ?? Path.GetFileName(fullFilePath);

               // Return file as download
               var fileBytes = await System.IO.File.ReadAllBytesAsync(fullFilePath);
               return File(fileBytes, "application/octet-stream", fileName);
           }
           catch (Exception ex)
           {
               _logger.LogError(ex, "Error downloading ROM {Id}", id);
               return StatusCode(500, new { success = false, message = "An error occurred while downloading the ROM" });
           }
       }
    }
}