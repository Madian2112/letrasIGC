import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';

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
  @ViewChild('pdfViewer', { static: false }) pdfViewer!: ElementRef;

  pdfs: Pdf[] = [];
  filteredPdfs: Pdf[] = [];
  selectedPdf: Pdf | null = null;
  searchQuery: string = '';
  pdfSrc: string | null = null;
  zoom: number = 1;
  minZoom: number = 0.5;
  maxZoom: number = 3;
  pdfDocument: PDFDocumentProxy | null = null;

  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private lastTouchDistance: number = 0;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.pdfs = [
      { title: 'Alaba al Señor', url: '../../../assets/pdf/LETRA_Alaba_Al_Señor.pdf', dateAdded: '2023-06-01' },
      { title: 'Perfecto Amor', url: '../../../assets/pdf/LETRA_Perfecto_Amor.pdf', dateAdded: '2023-06-02' },
      { title: 'Salmo 84', url: '../../../assets/pdf/LETRA_Salmo_84.pdf', dateAdded: '2023-06-03' },
    ];
    this.filterPdfs();
  }

  filterPdfs() {
    this.filteredPdfs = this.pdfs
      .sort((a, b) => a.title.localeCompare(b.title))
      .filter(pdf => pdf.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }
  
  handleViewPdf(pdf: Pdf) {
    this.selectedPdf = pdf;
    this.pdfSrc = pdf.url;
    this.zoom = 1;
  }

  handleClosePdf() {
    this.selectedPdf = null;
    this.pdfSrc = null;
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onPdfLoaded(pdf: PDFDocumentProxy) {
    this.pdfDocument = pdf;
  }

  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    if (this.selectedPdf && event.ctrlKey && this.isMouseOverPdf(event)) {
      event.preventDefault();
      const delta = event.deltaY || event.detail || (event as any).wheelDelta;
      this.adjustZoom(delta > 0 ? -0.1 : 0.1);
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      this.lastTouchDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
    } else if (event.touches.length === 1) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (event.touches.length === 2) {
      const currentDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
      const delta = currentDistance - this.lastTouchDistance;
      this.adjustZoom(delta * 0.01);
      this.lastTouchDistance = currentDistance;
    }
  }

  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private adjustZoom(delta: number) {
    this.zoom = Math.min(Math.max(this.zoom + delta, this.minZoom), this.maxZoom);
  }

  zoomIn() {
    this.adjustZoom(0.1);
  }

  zoomOut() {
    this.adjustZoom(-0.1);
  }

  resetZoom() {
    this.zoom = 1;
  }

  private isMouseOverPdf(event: MouseEvent): boolean {
    if (this.pdfViewer) {
      const rect = this.pdfViewer.nativeElement.getBoundingClientRect();
      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    }
    return false;
  }
}