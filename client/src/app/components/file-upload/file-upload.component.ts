import { Component, EventEmitter, Output } from '@angular/core';
import { BlobStorageService } from '../../services/blob-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Output() uploadCompleted = new EventEmitter<void>();  // Changed from uploadSuccess
  selectedFile: File | null = null;
  isUploading = false;

  constructor(
    private blobStorage: BlobStorageService,
    private snackBar: MatSnackBar
  ) { }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.blobStorage.uploadFile(this.selectedFile).subscribe({
      next: () => {
        this.snackBar.open('File uploaded successfully', 'Close', { duration: 3000 });
        this.selectedFile = null;
        this.isUploading = false;
        this.uploadCompleted.emit();  // Emit event when upload is complete
      },
      error: (err) => {
        this.snackBar.open('Error uploading file', 'Close', { duration: 3000 });
        console.error(err);
        this.isUploading = false;
      }
    });
  }
}
