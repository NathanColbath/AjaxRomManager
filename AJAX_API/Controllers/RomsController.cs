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
    [ApiController]
    [Route("api/[controller]")]
    public class RomsController : ControllerBase
    {
       
       private readonly IRomsManagmentService _romsManagmentService;
       public RomsController(IRomsManagmentService romsManagmentService)
       {
        _romsManagmentService = romsManagmentService;
       }

       [HttpGet]
       public async Task<ActionResult<IEnumerable<Rom>>> GetRoms()
       {
        var roms = await _romsManagmentService.GetRoms();
        return Ok(roms);
       }

       [HttpGet("{id}")]
       public async Task<ActionResult<Rom>> GetRomById(int id)
       {
        var rom = await _romsManagmentService.GetRomById(id);
        return Ok(rom);
       }

       [HttpPost]
       public async Task<ActionResult<Rom>> CreateRom(Rom rom)
       {
        var createdRom = await _romsManagmentService.CreateRom(rom);
        return CreatedAtAction(nameof(GetRomById), new { id = createdRom.Id }, createdRom);
       }

       [HttpPut("{id}")]
       public async Task<ActionResult<Rom>> UpdateRom(int id, Rom rom)
       {
        var updatedRom = await _romsManagmentService.UpdateRom(id, rom);
        return Ok(updatedRom);
       }

       [HttpDelete("{id}")]
       public async Task<ActionResult<Rom>> DeleteRom(int id)
       {
        var deletedRom = await _romsManagmentService.DeleteRom(id);
        return Ok(deletedRom);
       }

       [HttpGet("{id}/metadata")]
       public async Task<ActionResult<RomMetadata>> GetRomMetadata(int id)
       {
        var metadata = await _romsManagmentService.GetRomMetadata(id);
        return Ok(metadata);
       }

       [HttpPost("{id}/metadata")]
       public async Task<ActionResult<RomMetadata>> CreateRomMetadata(int id, RomMetadata romMetadata)
       {
        var createdMetadata = await _romsManagmentService.CreateRomMetadata(romMetadata);
        return CreatedAtAction(nameof(GetRomMetadata), new { id = createdMetadata.Id }, createdMetadata);
       }
    }
}