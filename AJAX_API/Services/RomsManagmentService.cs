using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AjaxRomManager.Api.Data;
using AjaxRomManager.Api.Models;

namespace AJAX_API.Services
{

    public interface IRomsManagmentService
    {
        Task<IEnumerable<Rom>> GetRoms();
        Task<Rom?> GetRomById(int id);
        Task<Rom?> CreateRom(Rom rom);
        Task<Rom?> UpdateRom(int id, Rom rom);
        Task<Rom?> DeleteRom(int id);

        Task<RomMetadata?> GetRomMetadata(int id);
        Task<RomMetadata?> CreateRomMetadata(RomMetadata romMetadata);
        Task<RomMetadata?> UpdateRomMetadata(int id, RomMetadata romMetadata);
        Task<RomMetadata?> DeleteRomMetadata(int id);
    }

    public class RomsManagmentService : IRomsManagmentService
    {

        private readonly ApplicationDbContext context;
        public RomsManagmentService(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<IEnumerable<Rom>> GetRoms()
        {
            return await context.Roms.ToListAsync();
        }

        public async Task<Rom?> GetRomById(int id)
        {
            return await context.Roms.FindAsync(id);
        }

        public async Task<Rom?> CreateRom(Rom rom)
        {
            context.Roms.Add(rom);
            await context.SaveChangesAsync();
            return rom;
        }

        public async Task<Rom?> UpdateRom(int id, Rom rom)
        {
            context.Roms.Update(rom);
            await context.SaveChangesAsync();
            return rom;
        }

        public async Task<Rom?> DeleteRom(int id)
        {
            var rom = await context.Roms.FindAsync(id);
            if (rom == null) return null;
            context.Roms.Remove(rom);
            await context.SaveChangesAsync();
            return rom;
        }

        public async Task<RomMetadata?> GetRomMetadata(int id)
        {
            return await context.RomMetadata.FindAsync(id);
        }

        public async Task<RomMetadata?> CreateRomMetadata(RomMetadata romMetadata)
        {
            context.RomMetadata.Add(romMetadata);
            await context.SaveChangesAsync();
            return romMetadata;
        }

        public async Task<RomMetadata?> UpdateRomMetadata(int id, RomMetadata romMetadata)
        {
            context.RomMetadata.Update(romMetadata);
            await context.SaveChangesAsync();
            return romMetadata;
        }

        public async Task<RomMetadata?> DeleteRomMetadata(int id)
        {
            var romMetadata = await context.RomMetadata.FindAsync(id);
            if (romMetadata == null) return null;
            context.RomMetadata.Remove(romMetadata);
            await context.SaveChangesAsync();
            return romMetadata;
        }
    }
}