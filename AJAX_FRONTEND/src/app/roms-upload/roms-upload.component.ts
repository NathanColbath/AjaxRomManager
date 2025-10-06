import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { RomUploadService, RomUploadResult, PlatformDetectionResult } from '../services/rom-upload.service';
import { PlatformsService } from '../services/platforms.service';
import { NotificationService } from '../services/notification.service';
import { Platform } from '../models/rom.model';

@Component({
  selector: 'app-roms-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roms-upload.component.html',
  styleUrl: './roms-upload.component.scss'
})
export class RomsUploadComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Component state
  platforms: Platform[] = [];
  uploadResults: RomUploadResult[] = [];
  isUploading = false;
  overallProgress = 0;
  dragOver = false;
  
  // File handling
  selectedFiles: File[] = [];
  filePlatformMap = new Map<string, number>(); // Maps filename to platformId
  duplicateFiles: { file: File; existingRom: any }[] = [];
  
  // UI state
  showPlatformSelection = false;
  showDuplicateWarning = false;
  filesNeedingPlatformSelection: PlatformDetectionResult[] = [];
  private isProcessingFiles = false;
  isDetectingPlatforms = false;

  constructor(
    private romUploadService: RomUploadService,
    private platformsService: PlatformsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPlatforms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPlatforms(): void {
    this.platformsService.getActivePlatforms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (platforms) => {
          this.platforms = platforms;
        },
        error: (error) => {
          console.error('Error loading platforms:', error);
        }
      });
  }

  // Drag and drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    
    // Prevent duplicate processing
    if (this.isProcessingFiles) {
      return;
    }
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    // Prevent duplicate processing
    if (this.isProcessingFiles) {
      return;
    }
    
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
    }
    
    // Clear the input value to allow selecting the same files again
    input.value = '';
  }

  private handleFiles(files: File[]): void {
    // Set processing flag to prevent duplicate calls
    this.isProcessingFiles = true;
    
    // Show info notification about file processing
    this.notificationService.showInfo(
      'Processing Files',
      `Analyzing ${files.length} file(s) for duplicates and platform detection...`
    );

    // Validate files and check for duplicates
    this.romUploadService.validateFilesForDuplicates(files)
      .then(({ validFiles, duplicates }) => {
        if (duplicates.length > 0) {
          this.duplicateFiles = [...this.duplicateFiles, ...duplicates];
          this.showDuplicateWarning = true;
          
          // Show persistent warning about duplicates
          this.notificationService.showPersistentWarning(
            'Duplicate Files Detected',
            `${duplicates.length} file(s) already exist in your collection. Please review the duplicates section below.`
          );
        }

        if (validFiles.length > 0) {
          this.selectedFiles = [...this.selectedFiles, ...validFiles];
          this.detectPlatformsForFiles(validFiles);
          
          // Show success notification for valid files
          this.notificationService.showSuccess(
            'Files Ready for Upload',
            `${validFiles.length} file(s) validated and ready for upload.`
          );
        }

        if (validFiles.length === 0 && duplicates.length > 0) {
          this.notificationService.showWarning(
            'No New Files to Upload',
            'All selected files are duplicates. Please remove duplicates or upload anyway.'
          );
        }
        
        // Clear processing flag
        this.isProcessingFiles = false;
      })
      .catch(error => {
        console.error('Error validating files:', error);
        this.notificationService.showError(
          'File Validation Error',
          'Failed to validate files. Using fallback validation.'
        );
        // Fallback to original validation if duplicate check fails
        this.handleFilesFallback(files);
        // Clear processing flag
        this.isProcessingFiles = false;
      });
  }

  private handleFilesFallback(files: File[]): void {
    // Validate files (original logic)
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      const validation = this.romUploadService.validateRomFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push(`${file.name}: ${validation.error}`);
      }
    });

    if (invalidFiles.length > 0) {
      alert(`Invalid files:\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
      this.detectPlatformsForFiles(validFiles);
    }
    
    // Clear processing flag
    this.isProcessingFiles = false;
  }

  private detectPlatformsForFiles(files: File[]): void {
    this.isDetectingPlatforms = true;
    const filesNeedingSelection: PlatformDetectionResult[] = [];
    
    files.forEach(file => {
      const detection = this.romUploadService.detectPlatform(file, this.platforms);
      
      if (detection.recommendedPlatform) {
        // Auto-assign platform
        this.filePlatformMap.set(file.name, detection.recommendedPlatform.id!);
      } else if (detection.possiblePlatforms.length > 0) {
        // Needs manual selection
        filesNeedingSelection.push(detection);
      } else {
        // No platform found
        console.warn(`No platform found for file: ${file.name}`);
      }
    });

    if (filesNeedingSelection.length > 0) {
      this.filesNeedingPlatformSelection = filesNeedingSelection;
      this.showPlatformSelection = true;
    }
    
    this.isDetectingPlatforms = false;
    // Note: Removed automatic startUpload() call - user must click "Start Upload" button
  }

  onPlatformSelected(fileName: string, platformId: number): void {
    this.filePlatformMap.set(fileName, platformId);
    
    // Remove from files needing selection
    this.filesNeedingPlatformSelection = this.filesNeedingPlatformSelection.filter(
      f => f.fileName !== fileName
    );
    
    // If all files have platforms assigned, start upload
    if (this.filesNeedingPlatformSelection.length === 0) {
      this.showPlatformSelection = false;
      this.startUpload();
    }
  }

  startUpload(): void {
    if (this.selectedFiles.length === 0) return;

    this.isUploading = true;
    this.overallProgress = 0;
    this.uploadResults = [];

    // Show upload started notification
    this.notificationService.showInfo(
      'Upload Started',
      `Starting upload of ${this.selectedFiles.length} file(s)...`
    );

    // Group files by platform for batch uploads
    const filesByPlatform = new Map<number, File[]>();
    
    this.selectedFiles.forEach(file => {
      const platformId = this.filePlatformMap.get(file.name);
      if (platformId) {
        if (!filesByPlatform.has(platformId)) {
          filesByPlatform.set(platformId, []);
        }
        filesByPlatform.get(platformId)!.push(file);
      }
    });

    // Upload files for each platform
    const uploadObservables = Array.from(filesByPlatform.entries()).map(([platformId, files]) => {
      return this.romUploadService.uploadMultipleRoms(files, platformId)
        .pipe(
          catchError(error => {
            console.error(`Upload error for platform ${platformId}:`, error);
            return of({ error: error.message || 'Upload failed' });
          })
        );
    });

    // Execute all uploads
    forkJoin(uploadObservables)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.handleUploadResults(results);
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.isUploading = false;
          
          let errorMessage = 'An error occurred during the upload process. Please try again.';
          
          if (error.status === 0) {
            errorMessage = 'Connection failed. Please check if the server is running and try again.';
          } else if (error.status === 413) {
            errorMessage = 'File too large. Please try uploading smaller files (max 2GB).';
          } else if (error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.notificationService.showPersistentError(
            'Upload Failed',
            errorMessage
          );
        }
      });
  }

  private handleUploadResults(results: any[]): void {
    this.isUploading = false;
    this.overallProgress = 100;
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process results and update UI
    results.forEach((result, index) => {
      if (result.error) {
        // Handle error
        console.error('Upload failed:', result.error);
        errorCount++;
      } else if (Array.isArray(result)) {
        // Handle successful uploads
        result.forEach(uploadResponse => {
          const uploadResult: RomUploadResult = {
            fileName: uploadResponse.fileName,
            file: this.selectedFiles.find(f => f.name === uploadResponse.fileName)!,
            platformId: uploadResponse.platformId,
            platformName: uploadResponse.platformName,
            status: uploadResponse.success ? 'success' : 'error',
            progress: 100,
            result: uploadResponse
          };
          this.uploadResults.push(uploadResult);
          
          if (uploadResponse.success) {
            successCount++;
          } else {
            errorCount++;
          }
        });
      }
    });

    // Show appropriate notification based on results
    if (successCount > 0 && errorCount === 0) {
      this.notificationService.showPersistentSuccess(
        'Upload Completed Successfully',
        `${successCount} file(s) uploaded successfully to your ROM collection.`
      );
    } else if (successCount > 0 && errorCount > 0) {
      this.notificationService.showPersistentWarning(
        'Upload Completed with Errors',
        `${successCount} file(s) uploaded successfully, but ${errorCount} file(s) failed. Please check the results below.`
      );
    } else if (errorCount > 0) {
      this.notificationService.showPersistentError(
        'Upload Failed',
        `All ${errorCount} file(s) failed to upload. Please check the results below and try again.`
      );
    }

    // Clear selected files
    this.selectedFiles = [];
    this.filePlatformMap.clear();
  }

  removeFile(fileName: string): void {
    this.selectedFiles = this.selectedFiles.filter(f => f.name !== fileName);
    this.filePlatformMap.delete(fileName);
    this.filesNeedingPlatformSelection = this.filesNeedingPlatformSelection.filter(
      f => f.fileName !== fileName
    );
  }

  clearAll(): void {
    this.selectedFiles = [];
    this.filePlatformMap.clear();
    this.uploadResults = [];
    this.filesNeedingPlatformSelection = [];
    this.duplicateFiles = [];
    this.showPlatformSelection = false;
    this.showDuplicateWarning = false;
    this.isUploading = false;
    this.overallProgress = 0;
    this.isProcessingFiles = false;
    this.isDetectingPlatforms = false;
  }

  removeDuplicateFile(fileName: string): void {
    this.duplicateFiles = this.duplicateFiles.filter(d => d.file.name !== fileName);
    if (this.duplicateFiles.length === 0) {
      this.showDuplicateWarning = false;
    }
  }

  uploadDuplicatesAnyway(): void {
    // Add duplicate files to selected files and proceed with upload
    const duplicateFileNames = this.duplicateFiles.map(d => d.file.name);
    this.selectedFiles = [...this.selectedFiles, ...this.duplicateFiles.map(d => d.file)];
    
    // Clear duplicates and hide warning
    this.duplicateFiles = [];
    this.showDuplicateWarning = false;
    
    // Detect platforms for the newly added files
    const newlyAddedFiles = this.selectedFiles.filter(f => duplicateFileNames.includes(f.name));
    this.detectPlatformsForFiles(newlyAddedFiles);
  }

  dismissDuplicateWarning(): void {
    this.duplicateFiles = [];
    this.showDuplicateWarning = false;
  }

  getFileSize(file: File): string {
    return this.romUploadService.formatFileSize(file.size);
  }

  getPlatformName(platformId: number): string {
    const platform = this.platforms.find(p => p.id === platformId);
    return platform ? platform.name : 'Unknown';
  }
}
