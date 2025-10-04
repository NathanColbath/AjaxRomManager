import { Rom, Platform, RomMetadata } from '../models/rom.model';

// ========================================
// Mock Data for Development
// ========================================

export const mockPlatforms: Platform[] = [
  new Platform({
    id: 1,
    name: 'Nintendo Entertainment System',
    extension: '.nes',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    emulatorPath: '/emulators/fceux.exe',
    emulatorArguments: '--fullscreen'
  }),
  new Platform({
    id: 2,
    name: 'Super Nintendo Entertainment System',
    extension: '.sfc',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    emulatorPath: '/emulators/snes9x.exe',
    emulatorArguments: '--fullscreen'
  }),
  new Platform({
    id: 3,
    name: 'Sega Genesis',
    extension: '.gen',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    emulatorPath: '/emulators/kega.exe',
    emulatorArguments: '--fullscreen'
  }),
  new Platform({
    id: 4,
    name: 'Nintendo 64',
    extension: '.n64',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    emulatorPath: '/emulators/project64.exe',
    emulatorArguments: '--fullscreen'
  }),
  new Platform({
    id: 5,
    name: 'PlayStation',
    extension: '.iso',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    emulatorPath: '/emulators/epsxe.exe',
    emulatorArguments: '--fullscreen'
  }),
  new Platform({
    id: 6,
    name: 'Game Boy',
    extension: '.gb',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    emulatorPath: '/emulators/vba.exe',
    emulatorArguments: '--fullscreen'
  }),
  new Platform({
    id: 7,
    name: 'Game Boy Advance',
    extension: '.gba',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    emulatorPath: '/emulators/vba.exe',
    emulatorArguments: '--fullscreen'
  }),
  new Platform({
    id: 8,
    name: 'Sega Dreamcast',
    extension: '.cdi',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    emulatorPath: '/emulators/nulldc.exe',
    emulatorArguments: '--fullscreen'
  })
];

export const mockRoms: Rom[] = [
  new Rom({
    id: 1,
    title: 'Super Mario Bros.',
    fileName: 'super_mario_bros.nes',
    filePath: '/roms/nes/super_mario_bros.nes',
    fileSize: 40960,
    platformId: 1,
    platform: mockPlatforms[0],
    dateAdded: new Date('2023-01-15'),
    playCount: 15,
    isFavorite: true,
    metadata: new RomMetadata({
      id: 1,
      romId: 1,
      description: 'Classic platformer featuring Mario and Luigi',
      genre: 'Platform',
      developer: 'Nintendo',
      publisher: 'Nintendo',
      releaseDate: new Date('1985-09-13'),
      rating: 4.8,
      coverImagePath: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Super+Mario+Bros',
      lastUpdated: new Date('2023-01-15')
    })
  }),
  new Rom({
    id: 2,
    title: 'The Legend of Zelda: A Link to the Past',
    fileName: 'zelda_link_to_past.sfc',
    filePath: '/roms/snes/zelda_link_to_past.sfc',
    fileSize: 1048576,
    platformId: 2,
    platform: mockPlatforms[1],
    dateAdded: new Date('2023-01-16'),
    playCount: 8,
    isFavorite: true,
    metadata: new RomMetadata({
      id: 2,
      romId: 2,
      description: 'Action-adventure game in the Zelda series',
      genre: 'Action-Adventure',
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      releaseDate: new Date('1991-11-21'),
      rating: 4.9,
      coverImagePath: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Zelda+LTTP',
      lastUpdated: new Date('2023-01-16')
    })
  }),
  new Rom({
    id: 3,
    title: 'Sonic the Hedgehog',
    fileName: 'sonic_genesis.md',
    filePath: '/roms/genesis/sonic_genesis.md',
    fileSize: 524288,
    platformId: 3,
    platform: mockPlatforms[2],
    dateAdded: new Date('2023-01-17'),
    playCount: 12,
    isFavorite: false,
    metadata: new RomMetadata({
      id: 3,
      romId: 3,
      description: 'Classic platformer starring Sonic',
      genre: 'Platform',
      developer: 'Sonic Team',
      publisher: 'Sega',
      releaseDate: new Date('1991-06-23'),
      rating: 4.7,
      coverImagePath: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Sonic',
      lastUpdated: new Date('2023-01-17')
    })
  }),
  new Rom({
    id: 4,
    title: 'Super Mario 64',
    fileName: 'super_mario_64.n64',
    filePath: '/roms/n64/super_mario_64.n64',
    fileSize: 8388608,
    platformId: 4,
    platform: mockPlatforms[3],
    dateAdded: new Date('2023-01-18'),
    playCount: 25,
    isFavorite: true,
    metadata: new RomMetadata({
      id: 4,
      romId: 4,
      description: 'Revolutionary 3D platformer',
      genre: 'Platform',
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      releaseDate: new Date('1996-06-23'),
      rating: 4.9,
      coverImagePath: 'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Mario+64',
      lastUpdated: new Date('2023-01-18')
    })
  }),
  new Rom({
    id: 5,
    title: 'Final Fantasy VII',
    fileName: 'final_fantasy_vii.iso',
    filePath: '/roms/psx/final_fantasy_vii.iso',
    fileSize: 650000000,
    platformId: 5,
    platform: mockPlatforms[4],
    dateAdded: new Date('2023-01-19'),
    playCount: 35,
    isFavorite: true,
    metadata: new RomMetadata({
      id: 5,
      romId: 5,
      description: 'Epic RPG adventure',
      genre: 'RPG',
      developer: 'Square',
      publisher: 'Sony Computer Entertainment',
      releaseDate: new Date('1997-01-31'),
      rating: 4.8,
      coverImagePath: 'https://via.placeholder.com/300x200/FFEAA7/FFFFFF?text=FF+VII',
      lastUpdated: new Date('2023-01-19')
    })
  })
];