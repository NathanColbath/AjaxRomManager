using Microsoft.AspNetCore.Mvc;
using AjaxRomManager.Api.Models;
using AjaxRomManager.Api.Services;

namespace AjaxRomManager.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MetadataController : ControllerBase
    {
        private readonly IMetadataService _metadataService;

        public MetadataController(IMetadataService metadataService)
        {
            _metadataService = metadataService;
        }

        // GET: api/metadata
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RomMetadata>>> GetAllMetadata()
        {
            var metadata = await _metadataService.GetAllMetadataAsync();
            return Ok(metadata);
        }

        // GET: api/metadata/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RomMetadata>> GetMetadata(int id)
        {
            var metadata = await _metadataService.GetMetadataByIdAsync(id);
            if (metadata == null)
            {
                return NotFound();
            }
            return Ok(metadata);
        }

        // GET: api/metadata/rom/5
        [HttpGet("rom/{romId}")]
        public async Task<ActionResult<RomMetadata>> GetMetadataByRomId(int romId)
        {
            var metadata = await _metadataService.GetMetadataByRomIdAsync(romId);
            if (metadata == null)
            {
                return NotFound();
            }
            return Ok(metadata);
        }

        // POST: api/metadata
        [HttpPost]
        public async Task<ActionResult<RomMetadata>> CreateMetadata(RomMetadata metadata)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdMetadata = await _metadataService.CreateMetadataAsync(metadata);
            return CreatedAtAction(nameof(GetMetadata), new { id = createdMetadata.Id }, createdMetadata);
        }

        // PUT: api/metadata/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMetadata(int id, RomMetadata metadata)
        {
            if (id != metadata.Id)
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedMetadata = await _metadataService.UpdateMetadataAsync(id, metadata);
            if (updatedMetadata == null)
            {
                return NotFound();
            }

            return NoContent();
        }

        // DELETE: api/metadata/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMetadata(int id)
        {
            var result = await _metadataService.DeleteMetadataAsync(id);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        // DELETE: api/metadata/rom/5
        [HttpDelete("rom/{romId}")]
        public async Task<IActionResult> DeleteMetadataByRomId(int romId)
        {
            var result = await _metadataService.DeleteMetadataByRomIdAsync(romId);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}



