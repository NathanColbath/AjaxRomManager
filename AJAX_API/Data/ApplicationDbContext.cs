using Microsoft.EntityFrameworkCore;
using AjaxRomManager.Api.Models;

namespace AjaxRomManager.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Core entities
        public DbSet<User> Users { get; set; }
        public DbSet<Platform> Platforms { get; set; }
        public DbSet<Rom> Roms { get; set; }
        public DbSet<RomMetadata> RomMetadata { get; set; }
        
        // System entities
        public DbSet<SystemLog> SystemLogs { get; set; }
        public DbSet<ScanJob> ScanJobs { get; set; }
        public DbSet<SystemSettings> SystemSettings { get; set; }
        public DbSet<UserPreference> UserPreferences { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configurations
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Platform configurations
            modelBuilder.Entity<Platform>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Name).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Rom configurations
            modelBuilder.Entity<Rom>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.FilePath);
                entity.HasIndex(e => e.FileHash);
                entity.HasIndex(e => e.PlatformId);
                entity.Property(e => e.DateAdded).HasDefaultValueSql("GETUTCDATE()");
                
                entity.HasOne(e => e.Platform)
                    .WithMany(p => p.Roms)
                    .HasForeignKey(e => e.PlatformId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // RomMetadata configurations
            modelBuilder.Entity<RomMetadata>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.RomId).IsUnique();
                entity.Property(e => e.LastUpdated).HasDefaultValueSql("GETUTCDATE()");
                
                entity.HasOne(e => e.Rom)
                    .WithOne(r => r.Metadata)
                    .HasForeignKey<RomMetadata>(e => e.RomId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // SystemLog configurations
            modelBuilder.Entity<SystemLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Timestamp);
                entity.HasIndex(e => e.Level);
                entity.HasIndex(e => e.UserId);
                entity.Property(e => e.Timestamp).HasDefaultValueSql("GETUTCDATE()");
                
                entity.HasOne(e => e.User)
                    .WithMany(u => u.Logs)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // ScanJob configurations
            modelBuilder.Entity<ScanJob>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.PlatformId);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                
                entity.HasOne(e => e.Platform)
                    .WithMany(p => p.ScanJobs)
                    .HasForeignKey(e => e.PlatformId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // SystemSettings configurations
            modelBuilder.Entity<SystemSettings>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Key).IsUnique();
                entity.HasIndex(e => e.Category);
                entity.Property(e => e.LastModified).HasDefaultValueSql("GETUTCDATE()");
            });

            // UserPreference configurations
            modelBuilder.Entity<UserPreference>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.Key }).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                
                entity.HasOne(e => e.User)
                    .WithMany(u => u.Preferences)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
