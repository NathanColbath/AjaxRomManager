# Ajax Rom Manager

A modern ROM management application built with Angular frontend and C# Web API backend.

## Project Structure

```
Ajax Rom Manager/
├── AJAX_API/                 # C# Web API Backend
│   ├── Controllers/          # API Controllers
│   ├── Data/                # Entity Framework DbContext
│   ├── Models/              # Data Models
│   ├── Services/            # Business Logic Services
│   └── AjaxRomManager.Api.csproj
└── AJAX_FRONTEND/           # Angular Frontend
    ├── src/
    │   ├── app/
    │   │   ├── components/  # Angular Components
    │   │   ├── models/      # TypeScript Models
    │   │   ├── services/    # Angular Services
    │   │   └── app.routes.ts
    │   └── styles.scss      # Global Styles
    └── package.json
```

## Features

- **ROM Management**: Add, edit, delete, and organize ROM files
- **Platform Support**: Manage different gaming platforms
- **Modern UI**: Bootstrap-based responsive interface
- **RESTful API**: Clean API design with Entity Framework
- **File Management**: Track file sizes, dates, and metadata

## Getting Started

### Backend Setup (C# Web API)

1. Navigate to the `AJAX_API` directory
2. Restore packages:
   ```bash
   dotnet restore
   ```
3. Update database connection string in `appsettings.json`
4. Run the application:
   ```bash
   dotnet run
   ```
5. API will be available at `https://localhost:7000`

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

## API Endpoints

### ROMs
- `GET /api/roms` - Get all ROMs
- `GET /api/roms/{id}` - Get ROM by ID
- `POST /api/roms` - Create new ROM
- `PUT /api/roms/{id}` - Update ROM
- `DELETE /api/roms/{id}` - Delete ROM

### Platforms
- `GET /api/platforms` - Get all platforms
- `GET /api/platforms/{id}` - Get platform by ID
- `POST /api/platforms` - Create new platform
- `PUT /api/platforms/{id}` - Update platform
- `DELETE /api/platforms/{id}` - Delete platform

## Technologies Used

### Backend
- .NET 8.0
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- Swagger/OpenAPI

### Frontend
- Angular 17
- TypeScript
- Bootstrap 5
- RxJS
- Angular Router

## Development Notes

- The backend uses Entity Framework Code First approach
- CORS is configured to allow Angular app on localhost:4200
- Frontend uses standalone components (Angular 17+ feature)
- Bootstrap is included for responsive UI components
- Custom CSS classes are available for enhanced styling

## Next Steps

- Implement file upload functionality
- Add ROM emulation capabilities
- Create user authentication
- Add search and filtering features
- Implement cover image management

