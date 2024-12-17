import { Component , OnInit } from '@angular/core';
import { LucideAngularModule, Bell, Users, Home, Eye, Download, ArrowLeft, FileText } from 'lucide-angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Pdf {
  title: string;
  url: string;
  dateAdded: string;
}

@Component({
  selector: 'app-letras',
  templateUrl: './letras.component.html',
  styleUrls: ['./letras.component.css']
})
export class LetrasComponent implements OnInit {
  pdfs: Pdf[] = [];
  filteredPdfs: Pdf[] = [];
  selectedPdf: Pdf | null = null;
  searchQuery: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    // Simula la carga de PDFs. En una aplicación real, esto vendría de un servicio o API
    this.pdfs = [
      { title: 'Alaba al Señor', url: '../../../assets/pdf/LETRA-Alaba Al Señor.pdf', dateAdded: '2023-06-01' },
      { title: 'Perfecto Amor', url: '../../../assets/pdf/LETRA-Perfecto Amor.pdf', dateAdded: '2023-06-02' },
      { title: 'Salmo 84', url: '../../../assets/pdf/LETRA - Salmo 84.pdf', dateAdded: '2023-06-03' },
    ];
    this.filterPdfs();
  }

  filterPdfs() {
    this.filteredPdfs = this.pdfs
      .sort((a, b) => a.title.localeCompare(b.title))  // Ordena por título alfabéticamente
      .filter(pdf => pdf.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }
  
  handleViewPdf(pdf: Pdf) {
    this.selectedPdf = pdf;
  }

  handleClosePdf() {
    this.selectedPdf = null;
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
