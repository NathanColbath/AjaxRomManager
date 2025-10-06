namespace AJAX_API.Constants
{
    /// <summary>
    /// Constants for system settings keys to prevent typos and ensure consistency
    /// </summary>
    public static class SystemSettingsConstants
    {
        // Scanning Settings
        public const string SCAN_DEFAULT_DIRECTORY = "scan.default_directory";
        public const string SCAN_RECURSIVE = "scan.recursive";
        public const string SCAN_AUTO_DETECT_PLATFORM = "scan.auto_detect_platform";
        public const string SCAN_CREATE_METADATA = "scan.create_metadata";
        public const string SCAN_SKIP_DUPLICATES = "scan.skip_duplicates";
        public const string SCAN_MAX_FILE_SIZE_MB = "scan.max_file_size_mb";
        public const string SCAN_FILE_HASH_ALGORITHM = "scan.file_hash_algorithm";
        public const string SCAN_INCLUDE_SUBDIRECTORIES = "scan.include_subdirectories";
        public const string SCAN_PROGRESS_UPDATE_INTERVAL = "scan.progress_update_interval";
        public const string SCAN_ENABLE_BACKGROUND = "scan.enable_background";
        public const string SCAN_MAX_CONCURRENT = "scan.max_concurrent";
        public const string SCAN_DEFAULT_FILE_PATTERNS = "scan.default_file_patterns";
        public const string SCAN_DEFAULT_EXCLUDE_PATTERNS = "scan.default_exclude_patterns";

        // ROM Management Settings
        public const string ROM_WORKING_DIRECTORY = "rom.working_directory";
        public const string ROM_AUTO_ORGANIZE = "rom.auto_organize";
        public const string ROM_DEFAULT_PLATFORM = "rom.default_platform";
        public const string ROM_MAX_UPLOAD_SIZE_MB = "rom.max_upload_size_mb";

        // User Interface Settings
        public const string UI_THEME = "ui.theme";
        public const string UI_ITEMS_PER_PAGE = "ui.items_per_page";
        public const string UI_DEFAULT_VIEW = "ui.default_view";
        public const string UI_SHOW_THUMBNAILS = "ui.show_thumbnails";
        public const string UI_THUMBNAIL_SIZE = "ui.thumbnail_size";

        // Notification Settings
        public const string NOTIFICATION_EMAIL_ENABLED = "notification.email_enabled";
        public const string NOTIFICATION_SCAN_ALERTS = "notification.scan_alerts";
        public const string NOTIFICATION_UPLOAD_ALERTS = "notification.upload_alerts";
        public const string NOTIFICATION_ERROR_ALERTS = "notification.error_alerts";

        // Backup Settings
        public const string BACKUP_SCHEDULE = "backup.schedule";
        public const string BACKUP_RETENTION_DAYS = "backup.retention_days";
        public const string BACKUP_CLEANUP_ORPHANS = "backup.cleanup_orphans";
        public const string BACKUP_OPTIMIZE_DATABASE = "backup.optimize_database";
        public const string BACKUP_AUTO_BACKUP = "backup.auto_backup";

        // Security Settings
        public const string SECURITY_ENABLE_AUTHENTICATION = "security.enable_authentication";
        public const string SECURITY_SESSION_TIMEOUT_MINUTES = "security.session_timeout_minutes";
        public const string SECURITY_MAX_LOGIN_ATTEMPTS = "security.max_login_attempts";
        public const string SECURITY_PASSWORD_MIN_LENGTH = "security.password_min_length";

        // Performance Settings
        public const string PERFORMANCE_CACHE_SIZE_MB = "performance.cache_size_mb";
        public const string PERFORMANCE_MAX_CONCURRENT_OPERATIONS = "performance.max_concurrent_operations";
        public const string PERFORMANCE_ENABLE_COMPRESSION = "performance.enable_compression";
        public const string PERFORMANCE_LOG_LEVEL = "performance.log_level";

        // Metadata Settings
        public const string METADATA_FETCH_FROM_ONLINE = "metadata.fetch_from_online";
        public const string METADATA_UPDATE_EXISTING = "metadata.update_existing";
        public const string METADATA_DOWNLOAD_IMAGES = "metadata.download_images";
        public const string METADATA_SCAN_INTERVAL = "metadata.scan_interval";
        public const string METADATA_CONCURRENT_SCANS = "metadata.concurrent_scans";

        // File Management Settings
        public const string FILE_MAX_UPLOAD_SIZE_MB = "file.max_upload_size_mb";
        public const string FILE_ALLOWED_EXTENSIONS = "file.allowed_extensions";
        public const string FILE_DEFAULT_STORAGE_PATH = "file.default_storage_path";
        public const string FILE_ENABLE_COMPRESSION = "file.enable_compression";

        // System Settings
        public const string SYSTEM_APP_NAME = "system.app_name";
        public const string SYSTEM_VERSION = "system.version";
        public const string SYSTEM_MAINTENANCE_MODE = "system.maintenance_mode";
        public const string SYSTEM_LOG_RETENTION_DAYS = "system.log_retention_days";
        public const string SYSTEM_AUTO_UPDATE_CHECK = "system.auto_update_check";

        // Default Values
        public static class DefaultValues
        {
            public const string DEFAULT_SCAN_DIRECTORY = "C:\\Roms";
            public const string DEFAULT_HASH_ALGORITHM = "SHA256";
            public const int DEFAULT_MAX_FILE_SIZE_MB = 2048; // 2GB
            public const int DEFAULT_MAX_CONCURRENT_SCANS = 3;
            public const int DEFAULT_PROGRESS_UPDATE_INTERVAL = 5;
            public const int DEFAULT_ITEMS_PER_PAGE = 24;
            public const int DEFAULT_SESSION_TIMEOUT_MINUTES = 30;
            public const int DEFAULT_MAX_LOGIN_ATTEMPTS = 5;
            public const int DEFAULT_PASSWORD_MIN_LENGTH = 8;
            public const int DEFAULT_CACHE_SIZE_MB = 100;
            public const int DEFAULT_LOG_RETENTION_DAYS = 30;
        }

        // Categories
        public static class Categories
        {
            public const string SCANNING = "Scanning";
            public const string ROM_MANAGEMENT = "ROM Management";
            public const string USER_INTERFACE = "User Interface";
            public const string NOTIFICATIONS = "Notifications";
            public const string BACKUP = "Backup";
            public const string SECURITY = "Security";
            public const string PERFORMANCE = "Performance";
            public const string METADATA = "Metadata";
            public const string FILE_MANAGEMENT = "File Management";
            public const string SYSTEM = "System";
        }

        // Descriptions
        public static class Descriptions
        {
            public const string SCAN_DEFAULT_DIRECTORY_DESC = "Default directory for ROM scanning and storage";
            public const string SCAN_RECURSIVE_DESC = "Whether to scan subdirectories recursively";
            public const string SCAN_AUTO_DETECT_PLATFORM_DESC = "Automatically detect platform from file extension";
            public const string SCAN_CREATE_METADATA_DESC = "Create metadata for scanned ROMs";
            public const string SCAN_SKIP_DUPLICATES_DESC = "Skip files that already exist in database";
            public const string SCAN_MAX_FILE_SIZE_MB_DESC = "Maximum file size in MB";
            public const string SCAN_FILE_HASH_ALGORITHM_DESC = "Hash algorithm for file integrity";
            public const string SCAN_INCLUDE_SUBDIRECTORIES_DESC = "Include subdirectories in scan";
            public const string SCAN_PROGRESS_UPDATE_INTERVAL_DESC = "Progress update interval in seconds";
            public const string SCAN_ENABLE_BACKGROUND_DESC = "Enable background scanning";
            public const string SCAN_MAX_CONCURRENT_DESC = "Maximum concurrent scan jobs";
            public const string SCAN_DEFAULT_FILE_PATTERNS_DESC = "Default file patterns to include";
            public const string SCAN_DEFAULT_EXCLUDE_PATTERNS_DESC = "Default file patterns to exclude";
        }
    }
}
