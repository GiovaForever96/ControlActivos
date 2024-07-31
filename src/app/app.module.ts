import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from './loading/loading.component';
import { ConsultaInformacionComponent } from './consulta-informacion/consulta-informacion.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { HomeModule } from './home/home.module';

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
    ConsultaInformacionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    ZXingScannerModule,
    HomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
