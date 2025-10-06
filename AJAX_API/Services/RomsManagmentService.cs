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
        Task<PagedResult<Rom>> GetRoms(int? platformId = null, string? searchTerm = null, bool? isFavorite = null, bool? isArchived = null, string? genre = null, string? developer = null, string? publisher = null, int? minRating = null, int? maxRating = null, string? sortBy = null, string? sortOrder = null, int page = 1, int pageSize = 20);
        Task<Rom?> GetRomById(int id);
        Task<Rom?> CreateRom(Rom rom);
        Task<Rom?> UpdateRom(int id, Rom rom);
        Task<Rom?> DeleteRom(int id);

        Task<RomMetadata?> GetRomMetadata(int id);
        Task<RomMetadata?> CreateRomMetadata(RomMetadata romMetadata);
        Task<RomMetadata?> UpdateRomMetadata(int id, RomMetadata romMetadata);
        Task<RomMetadata?> DeleteRomMetadata(int id);
        Task<Platform?> GetPlatformById(int id);
        Task<Rom?> GetRomByHash(string hash);
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

        public async Task<PagedResult<Rom>> GetRoms(int? platformId = null, string? searchTerm = null, bool? isFavorite = null, bool? isArchived = null, string? genre = null, string? developer = null, string? publisher = null, int? minRating = null, int? maxRating = null, string? sortBy = null, string? sortOrder = null, int page = 1, int pageSize = 20)
        {
            var query = context.Roms
                .Include(r => r.Metadata)
                .AsQueryable();

            // Apply filters
            if (platformId.HasValue)
            {
                query = query.Where(r => r.PlatformId == platformId.Value);
            }

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(r => r.Title.Contains(searchTerm) || 
                                       (r.FileName != null && r.FileName.Contains(searchTerm)));
            }

            if (isFavorite.HasValue)
            {
                query = query.Where(r => r.IsFavorite == isFavorite.Value);
            }

            if (isArchived.HasValue)
            {
                query = query.Where(r => r.IsArchived == isArchived.Value);
            }

            if (!string.IsNullOrEmpty(genre))
            {
                query = query.Where(r => r.Metadata != null && r.Metadata.Genre == genre);
            }

            if (!string.IsNullOrEmpty(developer))
            {
                query = query.Where(r => r.Metadata != null && r.Metadata.Developer == developer);
            }

            if (!string.IsNullOrEmpty(publisher))
            {
                query = query.Where(r => r.Metadata != null && r.Metadata.Publisher == publisher);
            }

            if (minRating.HasValue)
            {
                query = query.Where(r => r.Metadata != null && r.Metadata.Rating >= minRating.Value);
            }

            if (maxRating.HasValue)
            {
                query = query.Where(r => r.Metadata != null && r.Metadata.Rating <= maxRating.Value);
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Apply sorting
            switch (sortBy?.ToLower())
            {
                case "title":
                    query = sortOrder?.ToLower() == "desc" ? query.OrderByDescending(r => r.Title) : query.OrderBy(r => r.Title);
                    break;
                case "filesize":
                    query = sortOrder?.ToLower() == "desc" ? query.OrderByDescending(r => r.FileSize) : query.OrderBy(r => r.FileSize);
                    break;
                case "dateadded":
                    query = sortOrder?.ToLower() == "desc" ? query.OrderByDescending(r => r.DateAdded) : query.OrderBy(r => r.DateAdded);
                    break;
                case "rating":
                    query = sortOrder?.ToLower() == "desc" ? query.OrderByDescending(r => r.Metadata != null ? r.Metadata.Rating : 0) : query.OrderBy(r => r.Metadata != null ? r.Metadata.Rating : 0);
                    break;
                default:
                    query = query.OrderBy(r => r.Title);
                    break;
            }

            // Apply pagination
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<Rom>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
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

        public async Task<Platform?> GetPlatformById(int id)
        {
            return await context.Platforms.FindAsync(id);
        }

        public async Task<Rom?> GetRomByHash(string hash)
        {
            return await context.Roms
                .Include(r => r.Platform)
                .FirstOrDefaultAsync(r => r.FileHash == hash);
        }
    }
}