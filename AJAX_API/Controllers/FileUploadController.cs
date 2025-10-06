using Microsoft.AspNetCore.Mvc;

namespace AJAX_API.Controllers
{
    /// <summary>
    /// Controller for handling file uploads, particularly platform logos
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class FileUploadController : ControllerBase
    {
        private readonly ILogger<FileUploadController> _logger;
        private readonly IWebHostEnvironment _environment;
        private readonly string _uploadPath;

        public FileUploadController(ILogger<FileUploadController> logger, IWebHostEnvironment environment)
        {
            _logger = logger;
            _environment = environment;
            _uploadPath = Path.Combine(_environment.ContentRootPath, "uploads", "platforms");
            
            // Ensure upload directory exists
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        /// <summary>
        /// Uploads a platform logo image
        /// </summary>
        /// <param name="file">The image file to upload</param>
        /// <param name="platformId">Optional platform ID for organization</param>
        /// <returns>The file path of the uploaded image</returns>
        [HttpPost("platform-logo")]
        public async Task<ActionResult<string>> UploadPlatformLogo(IFormFile file, [FromQuery] int? platformId = null)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file provided");
                }

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.");
                }

                // Validate file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest("File size must be less than 5MB");
                }

                // Generate unique filename
                var fileExtension = Path.GetExtension(file.FileName).ToLower();
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                
                // Create platform-specific subdirectory if platformId is provided
                var uploadDir = platformId.HasValue 
                    ? Path.Combine(_uploadPath, platformId.Value.ToString())
                    : _uploadPath;
                
                if (!Directory.Exists(uploadDir))
                {
                    Directory.CreateDirectory(uploadDir);
                }

                var filePath = Path.Combine(uploadDir, fileName);

                // Save the file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return relative path for database storage
                var relativePath = Path.GetRelativePath(_environment.ContentRootPath, filePath)
                    .Replace("\\", "/"); // Use forward slashes for web compatibility

                _logger.LogInformation("Successfully uploaded platform logo: {FilePath}", relativePath);
                
                return Ok(new { filePath = relativePath });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading platform logo");
                return StatusCode(500, "An error occurred while uploading the file");
            }
        }

        /// <summary>
        /// Deletes a platform logo file
        /// </summary>
        /// <param name="filePath">The relative file path to delete</param>
        /// <returns>Success status</returns>
        [HttpDelete("platform-logo")]
        public ActionResult DeletePlatformLogo([FromQuery] string filePath)
        {
            try
            {
                if (string.IsNullOrEmpty(filePath))
                {
                    return BadRequest("File path is required");
                }

                var fullPath = Path.Combine(_environment.ContentRootPath, filePath);
                
                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                    _logger.LogInformation("Successfully deleted platform logo: {FilePath}", filePath);
                    return Ok(new { message = "File deleted successfully" });
                }
                else
                {
                    return NotFound("File not found");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting platform logo: {FilePath}", filePath);
                return StatusCode(500, "An error occurred while deleting the file");
            }
        }

        /// <summary>
        /// Serves platform logo images
        /// </summary>
        /// <param name="filePath">The relative file path</param>
        /// <returns>The image file</returns>
        [HttpGet("platform-logo")]
        public ActionResult GetPlatformLogo([FromQuery] string filePath)
        {
            try
            {
                if (string.IsNullOrEmpty(filePath))
                {
                    return BadRequest("File path is required");
                }

                var fullPath = Path.Combine(_environment.ContentRootPath, filePath);
                
                if (!System.IO.File.Exists(fullPath))
                {
                    return NotFound("File not found");
                }

                var contentType = GetContentType(fullPath);
                var fileBytes = System.IO.File.ReadAllBytes(fullPath);
                
                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error serving platform logo: {FilePath}", filePath);
                return StatusCode(500, "An error occurred while serving the file");
            }
        }

        /// <summary>
        /// Gets the content type for a file based on its extension
        /// </summary>
        private string GetContentType(string filePath)
        {
            var extension = Path.GetExtension(filePath).ToLower();
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                _ => "application/octet-stream"
            };
        }
    }
}
