import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from './loading/loading.component';
import { ConsultaInformacionComponent } from './consulta-informacion/consulta-informacion.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { HomeModule } from './home/home.module';
import { RegistroInventarioComponent } from './registro-inventario/registro-inventario.component';
import { AuthService } from './services/auth-interceptor.service';
import { ContextMenuModule } from 'primeng/contextmenu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
    ConsultaInformacionComponent,
    RegistroInventarioComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    ZXingScannerModule,
    HomeModule,
    ContextMenuModule,
    BrowserAnimationsModule
  ],
  providers: [
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
