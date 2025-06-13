import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BlobItem {
  name: string;
  url: string;
  properties: {
    lastModified: string;
    createdOn: string;
    contentLength: number;
    contentType: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BlobStorageService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  listFiles(): Observable<BlobItem[]> {
    return this.http.get<BlobItem[]>(`${this.apiUrl}/files`);
  }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  downloadFile(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${filename}`, {
      responseType: 'blob'
    });
  }

  deleteFile(filename: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${filename}`);
  }

  getFileUrl(filename: string): string {
    // Return the full URL for the file
    return `${this.apiUrl}/download/${filename}`;
  }
}
