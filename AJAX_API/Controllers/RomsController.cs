using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AjaxRomManager.Api.Data;
using AjaxRomManager.Api.Models;
using Microsoft.AspNetCore.Mvc;
using AJAX_API.Services;

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
       public RomsController(IRomsManagmentService romsManagmentService)
       {
        _romsManagmentService = romsManagmentService;
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
        return CreatedAtAction(nameof(GetRomById), new { id = createdRom.Id }, createdRom);
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
       /// Creates metadata for a specific ROM file
       /// </summary>
       /// <param name="id">The ID of the ROM file</param>
       /// <param name="romMetadata">The metadata to create</param>
       /// <returns>The created metadata</returns>
       [HttpPost("{id}/metadata")]
       public async Task<ActionResult<RomMetadata>> CreateRomMetadata(int id, RomMetadata romMetadata)
       {
        var createdMetadata = await _romsManagmentService.CreateRomMetadata(romMetadata);
        if (createdMetadata == null)
        {
            return BadRequest("Failed to create metadata");
        }
        return CreatedAtAction(nameof(GetRomMetadata), new { id = createdMetadata.Id }, createdMetadata);
       }
    }
}