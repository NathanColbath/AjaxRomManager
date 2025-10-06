# Ajax ROM Manager

A comprehensive ROM management application built with Angular frontend and C# Web API backend. Manage your ROM collection with advanced features including drag-and-drop uploads, platform auto-detection, duplicate detection, and custom modal system.

## 🚀 Features

### Core ROM Management
- **ROM Collection**: View, organize, and manage your ROM library
- **Platform Support**: Support for multiple gaming platforms (NES, SNES, Genesis, etc.)
- **File Organization**: Automatic organization into platform-specific directories
- **Metadata Management**: Track file information, sizes, and creation dates

### Advanced Upload System
- **Drag & Drop Upload**: Upload multiple ROMs simultaneously with intuitive drag-and-drop interface
- **Platform Auto-Detection**: Automatic platform detection based on file extensions
- **Manual Platform Selection**: Choose platform when multiple platforms support the same extension
- **Progress Tracking**: Real-time upload progress with per-file and overall progress bars
- **Duplicate Detection**: SHA-256 hash-based duplicate file detection
- **File Size Limits**: Configurable maximum file size (default: 2GB)

### File Management
- **ROM Downloads**: Download ROMs directly to your system
- **File Organization**: ROMs stored in `{id} - {platform_name}` directory structure
- **Working Directory**: Configurable ROM storage location via settings
- **Local Data Management**: Delete all local ROM files and images

### System Administration
- **Settings Management**: Comprehensive system configuration
- **Database Reset**: Complete database reset functionality
- **Scan Configuration**: Customizable scanning parameters
- **Notification System**: Persistent notifications for all operations
- **Custom Modals**: Bootstrap-based modal system replacing browser alerts

### User Interface
- **Responsive Design**: Bootstrap 5-based responsive interface
- **Modern Components**: Angular standalone components
- **Real-time Updates**: Live progress updates and notifications
- **Loading States**: Visual feedback for all operations
- **Error Handling**: Comprehensive error messages and recovery

## 📁 Project Structure

```
Ajax Rom Manager/
├── AJAX_API/                          # C# Web API Backend
│   ├── Controllers/                   # API Controllers
│   │   ├── FileUploadController.cs    # File upload handling
│   │   ├── MetadataController.cs      # ROM metadata management
│   │   ├── PlatformsController.cs    # Platform CRUD operations
│   │   ├── RomsController.cs          # ROM management & downloads
│   │   ├── ScanningController.cs      # File scanning operations
│   │   └── SystemSettingsController.cs # System configuration
│   ├── Constants/                     # System constants
│   │   └── SystemSettingsConstants.cs # Centralized settings keys
│   ├── Data/                         # Entity Framework
│   │   └── ApplicationDbContext.cs   # Database context
│   ├── Hubs/                         # SignalR hubs
│   │   └── ScanningHub.cs            # Real-time scan updates
│   ├── Models/                       # Data models
│   │   ├── Rom.cs                    # ROM entity
│   │   ├── RomMetadata.cs            # ROM metadata
│   │   ├── ScanConfiguration.cs      # Scan settings
│   │   ├── SystemSettings.cs         # System configuration
│   │   └── User.cs                   # User management
│   ├── Services/                     # Business logic
│   │   ├── FileScanningService.cs    # File scanning logic
│   │   ├── MetadataService.cs        # Metadata operations
│   │   ├── PlatformDetectionService.cs # Platform detection
│   │   ├── RomsManagmentService.cs   # ROM operations
│   │   └── SystemSettingsService.cs  # Settings management
│   └── uploads/                      # File storage
│       └── platforms/                # Platform images
└── AJAX_FRONTEND/                    # Angular Frontend
    ├── src/app/
    │   ├── components/               # Reusable components
    │   │   ├── modal/               # Custom modal system
    │   │   └── modal-container/     # Modal management
    │   ├── models/                   # TypeScript interfaces
    │   │   └── rom.model.ts         # ROM data model
    │   ├── services/                 # Angular services
    │   │   ├── api.service.ts       # HTTP client wrapper
    │   │   ├── download.service.ts  # File download handling
    │   │   ├── file-upload.service.ts # File upload logic
    │   │   ├── modal.service.ts     # Modal management
    │   │   ├── notification.service.ts # Notification system
    │   │   ├── platforms.service.ts # Platform operations
    │   │   ├── roms.service.ts      # ROM operations
    │   │   ├── scanning.service.ts  # Scan operations
    │   │   └── system-settings.service.ts # Settings API
    │   ├── rom-card/                # ROM display component
    │   ├── roms/                    # ROM collection view
    │   ├── roms-upload/             # Upload interface
    │   ├── scanning/                # Scan progress view
    │   ├── settings/                # System settings
    │   ├── systems/                 # Platform management
    │   └── navbar/                  # Navigation component
    └── styles.scss                  # Global styles
```

## 🛠️ Getting Started

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ and npm
- SQL Server (LocalDB or full instance)

### Backend Setup (C# Web API)

1. Navigate to the `AJAX_API` directory
2. Restore packages:
   ```bash
   dotnet restore
   ```
3. Update database connection string in `appsettings.json`
4. Run Entity Framework migrations:
   ```bash
   dotnet ef database update
   ```
5. Start the API server:
   ```bash
   dotnet run
   ```
6. API will be available at `https://localhost:7000` or `http://localhost:5005`

### Frontend Setup (Angular)

1. Navigate to the `AJAX_FRONTEND` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Application will be available at `http://localhost:4200`

## 🔌 API Endpoints

### ROM Management
- `GET /api/roms` - Get all ROMs with pagination
- `GET /api/roms/{id}` - Get ROM by ID
- `GET /api/roms/{id}/download` - Download ROM file
- `POST /api/roms` - Create new ROM
- `POST /api/roms/upload` - Upload single ROM
- `POST /api/roms/upload-multiple` - Upload multiple ROMs
- `POST /api/roms/check-duplicate` - Check for duplicate ROMs
- `PUT /api/roms/{id}` - Update ROM
- `DELETE /api/roms/{id}` - Delete ROM

### Platform Management
- `GET /api/platforms` - Get all platforms
- `GET /api/platforms/{id}` - Get platform by ID
- `POST /api/platforms` - Create new platform
- `PUT /api/platforms/{id}` - Update platform
- `DELETE /api/platforms/{id}` - Delete platform

### File Operations
- `POST /api/file-upload/platform-image` - Upload platform image
- `GET /api/file-upload/platform-image/{id}` - Get platform image

### System Settings
- `GET /api/system-settings` - Get all settings
- `GET /api/system-settings/scan-configuration` - Get scan configuration
- `PUT /api/system-settings/scan-configuration` - Update scan configuration
- `POST /api/system-settings/reset-database` - Reset entire database
- `POST /api/system-settings/delete-local-data` - Delete all local files

### Scanning Operations
- `POST /api/scanning/start` - Start file scanning
- `GET /api/scanning/progress/{jobId}` - Get scan progress
- `POST /api/scanning/cancel/{jobId}` - Cancel scan job

## 🎨 Technologies Used

### Backend
- **.NET 8.0** - Latest .NET framework
- **ASP.NET Core Web API** - RESTful API framework
- **Entity Framework Core** - ORM with Code First approach
- **SQL Server** - Database engine
- **SignalR** - Real-time communication
- **Swagger/OpenAPI** - API documentation

### Frontend
- **Angular 17** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **Bootstrap 5** - Responsive UI framework
- **RxJS** - Reactive programming
- **Angular Router** - Client-side routing
- **Font Awesome** - Icon library

## ⚙️ Configuration

### System Settings
The application uses a comprehensive settings system with the following key configurations:

- **Scan Directory**: Default location for ROM storage
- **File Size Limits**: Maximum file size for uploads (default: 2GB)
- **Hash Algorithm**: File integrity checking (SHA-256)
- **Auto-Detection**: Platform detection from file extensions
- **Duplicate Handling**: Skip or allow duplicate files
- **Background Scanning**: Enable/disable background operations

### File Organization
ROMs are automatically organized into directories following the pattern:
```
{working_directory}/{platform_id} - {platform_name}/{rom_file}
```

Example: `C:\Roms\1 - super_nintendo\Super Mario World.sfc`

## 🔧 Development Features

### Custom Modal System
- Replaces browser `alert()`, `confirm()`, and `prompt()` functions
- Bootstrap-styled modals with consistent UI
- Support for info, success, warning, error, confirm, and prompt types
- Keyboard shortcuts (Enter/Escape) and auto-focus

### Notification System
- Persistent notifications that remain until manually dismissed
- Support for success, error, warning, and info messages
- Real-time progress updates for long-running operations
- Integration with all major application features

### Error Handling
- Comprehensive error handling throughout the application
- User-friendly error messages
- Graceful degradation for network issues
- Detailed logging for debugging

## 🚀 Future Enhancements

- **ROM Emulation**: Built-in emulation capabilities
- **User Authentication**: Multi-user support with roles
- **Advanced Search**: Full-text search with filters
- **Cover Art Management**: Automatic cover art fetching
- **Backup & Restore**: Database backup functionality
- **Plugin System**: Extensible architecture for custom features
- **Mobile App**: React Native mobile application
- **Cloud Sync**: Cloud storage integration

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue on the GitHub repository.