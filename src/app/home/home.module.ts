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

@NgModule({
   declarations: [
      HomeComponent,
      HeaderComponent,
      SidebarComponent,
      MarcasComponent,
      ModelosComponent
   ],
   imports: [
      CommonModule,
      BrowserModule,
      RouterModule,
      ReactiveFormsModule,
      HomeRoutingModule,
      FormsModule
   ],
   providers: [],
   exports: [RouterModule]
})

export class HomeModule { }
