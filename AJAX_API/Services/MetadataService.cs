using AjaxRomManager.Api.Data;
using AjaxRomManager.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AjaxRomManager.Api.Services
{
    public interface IMetadataService
    {
        Task<IEnumerable<RomMetadata>> GetAllMetadataAsync();
        Task<RomMetadata?> GetMetadataByIdAsync(int id);
        Task<RomMetadata?> GetMetadataByRomIdAsync(int romId);
        Task<RomMetadata> CreateMetadataAsync(RomMetadata metadata);
        Task<RomMetadata?> UpdateMetadataAsync(int id, RomMetadata metadata);
        Task<bool> DeleteMetadataAsync(int id);
        Task<bool> DeleteMetadataByRomIdAsync(int romId);
    }

    public class MetadataService : IMetadataService
    {
        private readonly ApplicationDbContext _context;

        public MetadataService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RomMetadata>> GetAllMetadataAsync()
        {
            return await _context.RomMetadata
                .Include(m => m.Rom)
                    .ThenInclude(r => r!.Platform)
                .ToListAsync();
        }

        public async Task<RomMetadata?> GetMetadataByIdAsync(int id)
        {
            return await _context.RomMetadata
                .Include(m => m.Rom)
                    .ThenInclude(r => r!.Platform)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<RomMetadata?> GetMetadataByRomIdAsync(int romId)
        {
            return await _context.RomMetadata
                .Include(m => m.Rom)
                    .ThenInclude(r => r!.Platform)
                .FirstOrDefaultAsync(m => m.RomId == romId);
        }

        public async Task<RomMetadata> CreateMetadataAsync(RomMetadata metadata)
        {
            metadata.LastUpdated = DateTime.UtcNow;
            _context.RomMetadata.Add(metadata);
            await _context.SaveChangesAsync();
            return metadata;
        }

        public async Task<RomMetadata?> UpdateMetadataAsync(int id, RomMetadata metadata)
        {
            var existingMetadata = await _context.RomMetadata.FindAsync(id);
            if (existingMetadata == null) return null;

            existingMetadata.Description = metadata.Description;
            existingMetadata.Genre = metadata.Genre;
            existingMetadata.Developer = metadata.Developer;
            existingMetadata.Publisher = metadata.Publisher;
            existingMetadata.ReleaseDate = metadata.ReleaseDate;
            existingMetadata.Rating = metadata.Rating;
            existingMetadata.CoverImagePath = metadata.CoverImagePath;
            existingMetadata.ScreenshotPaths = metadata.ScreenshotPaths;
            existingMetadata.Tags = metadata.Tags;
            existingMetadata.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingMetadata;
        }

        public async Task<bool> DeleteMetadataAsync(int id)
        {
            var metadata = await _context.RomMetadata.FindAsync(id);
            if (metadata == null) return false;

            _context.RomMetadata.Remove(metadata);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteMetadataByRomIdAsync(int romId)
        {
            var metadata = await _context.RomMetadata
                .FirstOrDefaultAsync(m => m.RomId == romId);
            if (metadata == null) return false;

            _context.RomMetadata.Remove(metadata);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}