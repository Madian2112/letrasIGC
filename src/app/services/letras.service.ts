import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LetrasService {

  constructor(private http: HttpClient) {}

  downloadPdf(url: string, filename: string) {
    return this.http.get(url, { responseType: 'blob' })
      .subscribe(
        (response: Blob) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(downloadUrl);
        },
        (error) => {
          console.error('Error al descargar el PDF:', error);
        }
      );
  }
}
