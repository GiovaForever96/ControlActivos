import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HomeRoutingModule } from './home-routing.module';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MarcasComponent } from './marcas/marcas.component';
import { ModelosComponent } from './modelos/modelos.component';
import { CustodiosComponent } from './custodios/custodios.component';
import { ActivosComponent } from './activos/activos.component';
import { InventarioComponent } from './inventario/inventario.component';
import { AuthService } from '../services/auth-interceptor.service';

@NgModule({
   declarations: [
      HomeComponent,
      HeaderComponent,
      SidebarComponent,
      MarcasComponent,
      ModelosComponent,
      CustodiosComponent,
      ActivosComponent,
      InventarioComponent
   ],
   imports: [
      CommonModule,
      BrowserModule,
      RouterModule,
      ReactiveFormsModule,
      HomeRoutingModule,
      FormsModule
   ],
   providers: [
      AuthService
   ],
   exports: [RouterModule]
})

export class HomeModule { }
