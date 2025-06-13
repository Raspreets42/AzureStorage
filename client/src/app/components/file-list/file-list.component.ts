import { Component, OnInit } from '@angular/core';
import { BlobStorageService, BlobItem } from '../../services/blob-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {
  files: BlobItem[] = [];
  isLoading = false;

  constructor(
    private blobStorage: BlobStorageService,
    private snackBar: MatSnackBar,
    private clipboard: Clipboard
  ) { }

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.isLoading = true;
    this.blobStorage.listFiles().subscribe({
      next: (files) => {
        this.files = files;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Error loading files', 'Close', { duration: 3000 });
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  copyFileUrl(file: BlobItem): void {
    const fileUrl = this.blobStorage.getFileUrl(file.name);
    this.clipboard.copy(fileUrl);
    this.snackBar.open('URL copied to clipboard!', 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  downloadFile(file: BlobItem): void {
    this.blobStorage.downloadFile(file.name).subscribe({
      next: (blob) => {
        saveAs(blob, file.name);
      },
      error: (err) => {
        this.snackBar.open('Error downloading file', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

  deleteFile(file: BlobItem): void {
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      this.blobStorage.deleteFile(file.name).subscribe({
        next: () => {
          this.snackBar.open('File deleted successfully', 'Close', { duration: 3000 });
          this.loadFiles();
        },
        error: (err) => {
          this.snackBar.open('Error deleting file', 'Close', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch(extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
      case 'docx':
        return 'description';
      default:
        return 'insert_drive_file';
    }
  }
}
