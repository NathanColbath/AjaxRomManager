using AjaxRomManager.Api.Models;
using AjaxRomManager.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace AjaxRomManager.Api.Services
{
    public interface IRomService
    {
        Task<IEnumerable<Rom>> GetAllRomsAsync();
        Task<Rom?> GetRomByIdAsync(int id);
        Task<Rom> CreateRomAsync(Rom rom);
        Task<Rom?> UpdateRomAsync(int id, Rom rom);
        Task<bool> DeleteRomAsync(int id);
        Task<IEnumerable<Platform>> GetAllPlatformsAsync();
        Task<Platform?> GetPlatformByIdAsync(int id);
        Task<Platform> CreatePlatformAsync(Platform platform);
        Task<Platform?> UpdatePlatformAsync(int id, Platform platform);
        Task<bool> DeletePlatformAsync(int id);
    }

    public class RomService : IRomService
    {
        private readonly ApplicationDbContext _context;

        public RomService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Rom>> GetAllRomsAsync()
        {
            return await _context.Roms
                .Include(r => r.Platform)
                .ToListAsync();
        }

        public async Task<Rom?> GetRomByIdAsync(int id)
        {
            return await _context.Roms
                .Include(r => r.Platform)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<Rom> CreateRomAsync(Rom rom)
        {
            rom.DateAdded = DateTime.UtcNow;
            _context.Roms.Add(rom);
            await _context.SaveChangesAsync();
            return rom;
        }

        public async Task<Rom?> UpdateRomAsync(int id, Rom rom)
        {
            var existingRom = await _context.Roms.FindAsync(id);
            if (existingRom == null) return null;

            existingRom.Title = rom.Title;
            existingRom.FilePath = rom.FilePath;
            existingRom.FileSize = rom.FileSize;
            existingRom.PlatformId = rom.PlatformId;
            existingRom.Description = rom.Description;
            existingRom.CoverImagePath = rom.CoverImagePath;

            await _context.SaveChangesAsync();
            return existingRom;
        }

        public async Task<bool> DeleteRomAsync(int id)
        {
            var rom = await _context.Roms.FindAsync(id);
            if (rom == null) return false;

            _context.Roms.Remove(rom);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Platform>> GetAllPlatformsAsync()
        {
            return await _context.Platforms.ToListAsync();
        }

        public async Task<Platform?> GetPlatformByIdAsync(int id)
        {
            return await _context.Platforms.FindAsync(id);
        }

        public async Task<Platform> CreatePlatformAsync(Platform platform)
        {
            _context.Platforms.Add(platform);
            await _context.SaveChangesAsync();
            return platform;
        }

        public async Task<Platform?> UpdatePlatformAsync(int id, Platform platform)
        {
            var existingPlatform = await _context.Platforms.FindAsync(id);
            if (existingPlatform == null) return null;

            existingPlatform.Name = platform.Name;
            existingPlatform.Extension = platform.Extension;
            existingPlatform.EmulatorPath = platform.EmulatorPath;
            existingPlatform.EmulatorArguments = platform.EmulatorArguments;

            await _context.SaveChangesAsync();
            return existingPlatform;
        }

        public async Task<bool> DeletePlatformAsync(int id)
        {
            var platform = await _context.Platforms.FindAsync(id);
            if (platform == null) return false;

            _context.Platforms.Remove(platform);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

