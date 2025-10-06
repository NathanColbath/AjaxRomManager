using Microsoft.EntityFrameworkCore;
using AjaxRomManager.Api.Data;
using AjaxRomManager.Api.Services;
using AJAX_API.Services;
using AJAX_API.Hubs;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.IIS;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Configure file upload limits
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 2L * 1024 * 1024 * 1024; // 2GB
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 2L * 1024 * 1024 * 1024; // 2GB
    options.ValueLengthLimit = int.MaxValue;
    options.ValueCountLimit = int.MaxValue;
    options.KeyLengthLimit = int.MaxValue;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Ajax ROM Manager API",
        Version = "v1",
        Description = "API for managing ROM collections and metadata",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Ajax ROM Manager Team",
            Email = "support@ajaxrommanager.com"
        }
    });

    // Include XML comments
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = System.IO.Path.Combine(System.AppContext.BaseDirectory, xmlFile);
    if (System.IO.File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR
    });
});

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add SignalR
builder.Services.AddSignalR();

// Add custom services
builder.Services.AddScoped<IMetadataService, MetadataService>();
builder.Services.AddScoped<IRomsManagmentService, RomsManagmentService>();
builder.Services.AddScoped<ISystemSettingsService, SystemSettingsService>();
builder.Services.AddScoped<IPlatformDetectionService, PlatformDetectionService>();
builder.Services.AddScoped<IScanningNotificationService, ScanningNotificationService>();
builder.Services.AddScoped<IFileScanningService, FileScanningService>();

// Add background service
builder.Services.AddHostedService<FileScanningBackgroundService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
// Enable Swagger in all environments for testing
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Ajax ROM Manager API v1");
    c.RoutePrefix = string.Empty; // Set Swagger UI at the app's root
    c.DocumentTitle = "Ajax ROM Manager API Documentation";
    c.DefaultModelsExpandDepth(-1); // Hide schemas section by default
});

// app.UseHttpsRedirection(); // Commented out for HTTP testing on port 5005
app.UseCors("AllowAngularApp");
app.UseAuthorization();
app.MapControllers();

// Map SignalR hubs
app.MapHub<ScanningHub>("/scanningHub");

// Configure the application to run on port 5005
app.Urls.Add("http://localhost:5005");

app.Run();
