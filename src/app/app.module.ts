import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LetrasComponent } from './pages/letras/letras.component';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Bell, Users, Home, Eye, Download, ArrowLeft, FileText } from 'lucide-angular';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [
    AppComponent,
    LetrasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    LucideAngularModule.pick({ Bell, Users, Home, Eye, Download, ArrowLeft, FileText }),
    PdfViewerModule  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
