import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, apiRoutes } from '../services/api.service';
import { Rom, Platform, RomFilter } from '../models/rom.model';
import { RomCardComponent } from '../rom-card/rom-card.component';

@Component({
  selector: 'app-roms',
  standalone: true,
  imports: [CommonModule, FormsModule, RomCardComponent],
  templateUrl: './roms.component.html',
  styleUrl: './roms.component.scss'
})
export class RomsComponent implements OnInit {
  roms: Rom[] = [];
  filteredRoms: Rom[] = [];
  platforms: Platform[] = [];
  filter: RomFilter = {
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc'
  };
  loading = false;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // ========================================
    // SWITCHING BETWEEN TEST DATA AND API
    // ========================================
    
    // FOR TEST DATA (current setup):
    this.loadTestData();
    
    // FOR REAL API (when backend is ready):
    // this.loadRoms();
    // this.loadPlatforms();
  }

  loadRoms(): void {
    this.loading = true;
    this.error = null;
    
    this.apiService.get<Rom[]>(apiRoutes.ROMS).subscribe({
      next: (roms) => {
        this.roms = roms;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ROMs:', error);
        this.error = 'Failed to load ROMs';
        this.loading = false;
      }
    });
  }

  loadPlatforms(): void {
    this.apiService.get<Platform[]>(apiRoutes.PLATFORMS).subscribe({
      next: (platforms) => {
        this.platforms = platforms;
      },
      error: (error) => {
        console.error('Error loading platforms:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.roms];

    // Apply search filter
    if (this.filter.searchTerm.trim()) {
      const searchTerm = this.filter.searchTerm.toLowerCase();
      filtered = filtered.filter(rom => 
        rom.name.toLowerCase().includes(searchTerm) ||
        rom.fileName.toLowerCase().includes(searchTerm)
      );
    }

    // Apply platform filter
    if (this.filter.platformId) {
      filtered = filtered.filter(rom => rom.platformId === this.filter.platformId);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.filter.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'fileSize':
          comparison = a.fileSize - b.fileSize;
          break;
        case 'releaseDate':
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }
      
      return this.filter.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.filteredRoms = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onPlatformFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filter = {
      searchTerm: '',
      sortBy: 'name',
      sortOrder: 'asc'
    };
    this.applyFilters();
  }

  

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  }

  // ========================================
  // TEST DATA METHOD - Remove when using real API
  // ========================================
  loadTestData(): void {
    this.loading = true;
    
    // Simulate API delay
    setTimeout(() => {
      // Sample platforms
      this.platforms = [
        { id: 1, name: 'Nintendo Entertainment System', description: '8-bit home video game console' },
        { id: 2, name: 'Super Nintendo Entertainment System', description: '16-bit home video game console' },
        { id: 3, name: 'Sega Genesis', description: '16-bit home video game console' },
        { id: 4, name: 'Nintendo 64', description: '64-bit home video game console' },
        { id: 5, name: 'PlayStation', description: '32-bit home video game console' },
        { id: 6, name: 'Game Boy', description: '8-bit handheld video game console' },
        { id: 7, name: 'Game Boy Advance', description: '32-bit handheld video game console' },
        { id: 8, name: 'Sega Dreamcast', description: '128-bit home video game console' }
      ];

      // Sample ROMs
      this.roms = [
        {
          id: 1,
          name: 'Super Mario Bros.',
          fileName: 'super_mario_bros.nes',
          filePath: '/roms/nes/super_mario_bros.nes',
          fileSize: 40960,
          releaseDate: new Date('1985-09-13'),
          platformId: 1,
          platformName: 'Nintendo Entertainment System',
          description: 'Classic platformer featuring Mario and Luigi',
          imageUrl: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Super+Mario+Bros',
          isFavorite: true,
          playCount: 15
        },
        {
          id: 2,
          name: 'The Legend of Zelda: A Link to the Past',
          fileName: 'zelda_link_to_past.sfc',
          filePath: '/roms/snes/zelda_link_to_past.sfc',
          fileSize: 1048576,
          releaseDate: new Date('1991-11-21'),
          platformId: 2,
          platformName: 'Super Nintendo Entertainment System',
          description: 'Action-adventure game in the Zelda series',
          imageUrl: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Zelda+LTTP',
          isFavorite: true,
          playCount: 8
        },
        {
          id: 3,
          name: 'Sonic the Hedgehog',
          fileName: 'sonic_genesis.md',
          filePath: '/roms/genesis/sonic_genesis.md',
          fileSize: 524288,
          releaseDate: new Date('1991-06-23'),
          platformId: 3,
          platformName: 'Sega Genesis',
          description: 'Fast-paced platformer featuring Sonic',
          imageUrl: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Sonic',
          isFavorite: false,
          playCount: 3
        },
        {
          id: 4,
          name: 'Super Mario 64',
          fileName: 'mario_64.z64',
          filePath: '/roms/n64/mario_64.z64',
          fileSize: 8388608,
          releaseDate: new Date('1996-06-23'),
          platformId: 4,
          platformName: 'Nintendo 64',
          description: '3D platformer that revolutionized gaming',
          imageUrl: 'https://via.placeholder.com/300x200/FFA07A/FFFFFF?text=Mario+64',
          isFavorite: true,
          playCount: 12
        },
        {
          id: 5,
          name: 'Final Fantasy VII',
          fileName: 'ff7.bin',
          filePath: '/roms/psx/ff7.bin',
          fileSize: 134217728,
          releaseDate: new Date('1997-01-31'),
          platformId: 5,
          platformName: 'PlayStation',
          description: 'Epic RPG with memorable characters and story',
          imageUrl: 'https://via.placeholder.com/300x200/98D8C8/FFFFFF?text=FF+VII',
          isFavorite: true,
          playCount: 25
        },
        {
          id: 6,
          name: 'Pokémon Red',
          fileName: 'pokemon_red.gb',
          filePath: '/roms/gb/pokemon_red.gb',
          fileSize: 1048576,
          releaseDate: new Date('1996-02-27'),
          platformId: 6,
          platformName: 'Game Boy',
          description: 'Catch, train, and battle Pokémon',
          imageUrl: 'https://via.placeholder.com/300x200/F7DC6F/FFFFFF?text=Pokemon+Red',
          isFavorite: false,
          playCount: 18
        },
        {
          id: 7,
          name: 'Metroid Fusion',
          fileName: 'metroid_fusion.gba',
          filePath: '/roms/gba/metroid_fusion.gba',
          fileSize: 8388608,
          releaseDate: new Date('2002-11-17'),
          platformId: 7,
          platformName: 'Game Boy Advance',
          description: 'Action-adventure with Samus Aran',
          imageUrl: 'https://via.placeholder.com/300x200/BF80FF/FFFFFF?text=Metroid',
          isFavorite: true,
          playCount: 7
        },
        {
          id: 8,
          name: 'Shenmue',
          fileName: 'shenmue.cdi',
          filePath: '/roms/dreamcast/shenmue.cdi',
          fileSize: 1073741824,
          releaseDate: new Date('1999-12-29'),
          platformId: 8,
          platformName: 'Sega Dreamcast',
          description: 'Adventure game set in 1980s Japan',
          imageUrl: 'https://via.placeholder.com/300x200/F8B500/FFFFFF?text=Shenmue',
          isFavorite: false,
          playCount: 2
        },
        {
          id: 9,
          name: 'Chrono Trigger',
          fileName: 'chrono_trigger.sfc',
          filePath: '/roms/snes/chrono_trigger.sfc',
          fileSize: 4194304,
          releaseDate: new Date('1995-03-11'),
          platformId: 2,
          platformName: 'Super Nintendo Entertainment System',
          description: 'Time-traveling RPG masterpiece',
          imageUrl: 'https://via.placeholder.com/300x200/FF6B9D/FFFFFF?text=Chrono+Trigger',
          isFavorite: true,
          playCount: 22
        },
        {
          id: 10,
          name: 'Street Fighter II',
          fileName: 'sf2.md',
          filePath: '/roms/genesis/sf2.md',
          fileSize: 2097152,
          releaseDate: new Date('1992-08-01'),
          platformId: 3,
          platformName: 'Sega Genesis',
          description: 'Classic fighting game',
          imageUrl: 'https://via.placeholder.com/300x200/FF9F43/FFFFFF?text=SF+II',
          isFavorite: false,
          playCount: 5
        },
        {
          id: 11,
          name: 'The Legend of Zelda: Ocarina of Time',
          fileName: 'zelda_ocarina.z64',
          filePath: '/roms/n64/zelda_ocarina.z64',
          fileSize: 33554432,
          releaseDate: new Date('1998-11-21'),
          platformId: 4,
          platformName: 'Nintendo 64',
          description: 'Revolutionary 3D adventure game',
          imageUrl: 'https://via.placeholder.com/300x200/55A3FF/FFFFFF?text=Zelda+OoT',
          isFavorite: true,
          playCount: 14
        },
        {
          id: 12,
          name: 'Castlevania: Symphony of the Night',
          fileName: 'sotn.bin',
          filePath: '/roms/psx/sotn.bin',
          fileSize: 67108864,
          releaseDate: new Date('1997-03-20'),
          platformId: 5,
          platformName: 'PlayStation',
          description: 'Metroidvania-style action RPG',
          imageUrl: 'https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Castlevania',
          isFavorite: true,
          playCount: 9
        },
        {
          id: 13,
          name: 'Tetris',
          fileName: 'tetris.gb',
          filePath: '/roms/gb/tetris.gb',
          fileSize: 32768,
          releaseDate: new Date('1989-06-14'),
          platformId: 6,
          platformName: 'Game Boy',
          description: 'Classic puzzle game',
          imageUrl: 'https://via.placeholder.com/300x200/E74C3C/FFFFFF?text=Tetris',
          isFavorite: false,
          playCount: 45
        },
        {
          id: 14,
          name: 'Advance Wars',
          fileName: 'advance_wars.gba',
          filePath: '/roms/gba/advance_wars.gba',
          fileSize: 4194304,
          releaseDate: new Date('2001-09-10'),
          platformId: 7,
          platformName: 'Game Boy Advance',
          description: 'Turn-based strategy game',
          imageUrl: 'https://via.placeholder.com/300x200/27AE60/FFFFFF?text=Advance+Wars',
          isFavorite: false,
          playCount: 6
        },
        {
          id: 15,
          name: 'SoulCalibur',
          fileName: 'soulcalibur.cdi',
          filePath: '/roms/dreamcast/soulcalibur.cdi',
          fileSize: 536870912,
          releaseDate: new Date('1998-07-30'),
          platformId: 8,
          platformName: 'Sega Dreamcast',
          description: 'Weapon-based fighting game',
          imageUrl: 'https://via.placeholder.com/300x200/9B59B6/FFFFFF?text=SoulCalibur',
          isFavorite: false,
          playCount: 4
        }
      ];

      this.applyFilters();
      this.loading = false;
    }, 1000); // Simulate 1 second loading time
  }
}
