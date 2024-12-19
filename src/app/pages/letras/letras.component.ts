import { Component, OnInit, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import letras from './letras.json'; // Usa importación por defecto
import {LetrasService} from '../../services/letras.service'

interface Pdf {
  title: string;
  url: string;
  version: string;
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
  private zoomCenter: { x: number, y: number } | null = null;

  constructor(private sanitizer: DomSanitizer, 
              private renderer: Renderer2,
              private pdfDownloadService : LetrasService) {}



  ngOnInit() {
    this.pdfs = (letras as any).usuarios;
    this.filterPdfs();
  }

  filterPdfs() {
    const removeAccents = (str: string) => 
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
    this.filteredPdfs = this.pdfs
      .sort((a, b) => removeAccents(a.title).localeCompare(removeAccents(b.title)))
      .filter(pdf => removeAccents(pdf.title.toLowerCase()).includes(removeAccents(this.searchQuery.toLowerCase())));
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
      const zoomFactor = delta > 0 ? 0.95 : 1.05;
      this.zoomToPoint(event.clientX, event.clientY, zoomFactor);
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 2 && this.pdfViewer) {
      event.preventDefault();
      this.lastTouchDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
      this.zoomCenter = this.getTouchCenter(event.touches[0], event.touches[1]);
    } else if (event.touches.length === 1) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (event.touches.length === 2 && this.pdfViewer) {
      event.preventDefault();
      const currentDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
      const zoomFactor = currentDistance / this.lastTouchDistance;
      this.lastTouchDistance = currentDistance;

      if (this.zoomCenter) {
        this.zoomToPoint(this.zoomCenter.x, this.zoomCenter.y, zoomFactor);
      }
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.zoomCenter = null;
  }

  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getTouchCenter(touch1: Touch, touch2: Touch): { x: number, y: number } {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }

  private zoomToPoint(clientX: number, clientY: number, zoomFactor: number) {
    if (this.pdfViewer) {
      const containerRect = this.pdfViewer.nativeElement.getBoundingClientRect();
      const offsetX = (clientX - containerRect.left) / containerRect.width;
      const offsetY = (clientY - containerRect.top) / containerRect.height;

      const oldZoom = this.zoom;
      this.zoom = Math.min(Math.max(this.zoom * zoomFactor, this.minZoom), this.maxZoom);

      if (oldZoom !== this.zoom) {
        const scrollElement = this.pdfViewer.nativeElement.querySelector('.ng2-pdf-viewer-container');
        if (scrollElement) {
          const newScrollLeft = (scrollElement.scrollLeft + offsetX * containerRect.width) * (this.zoom / oldZoom) - offsetX * containerRect.width;
          const newScrollTop = (scrollElement.scrollTop + offsetY * containerRect.height) * (this.zoom / oldZoom) - offsetY * containerRect.height;

          requestAnimationFrame(() => {
            scrollElement.scrollLeft = newScrollLeft;
            scrollElement.scrollTop = newScrollTop;
          });
        }
      }
    }
  }

  zoomIn() {
    if (this.pdfViewer) {
      const containerRect = this.pdfViewer.nativeElement.getBoundingClientRect();
      this.zoomToPoint(containerRect.left + containerRect.width / 2, containerRect.top + containerRect.height / 2, 1.1);
    }
  }

  zoomOut() {
    if (this.pdfViewer) {
      const containerRect = this.pdfViewer.nativeElement.getBoundingClientRect();
      this.zoomToPoint(containerRect.left + containerRect.width / 2, containerRect.top + containerRect.height / 2, 0.9);
    }
  }

  resetZoom() {
    this.zoom = 1;
    if (this.pdfViewer) {
      const scrollElement = this.pdfViewer.nativeElement.querySelector('.ng2-pdf-viewer-container');
      if (scrollElement) {
        scrollElement.scrollLeft = 0;
        scrollElement.scrollTop = 0;
      }
    }
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