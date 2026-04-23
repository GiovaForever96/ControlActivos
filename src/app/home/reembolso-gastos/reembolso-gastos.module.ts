import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IngresoReembolsoComponent } from './ingreso-reembolso/ingreso-reembolso.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReembolsoGastosComponent } from './reembolso-gastos.component';
import { ReembolsoGastosRoutingModule } from './reembolsos-routing.module';

@NgModule({
  declarations: [
    IngresoReembolsoComponent,
    ReembolsoGastosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReembolsoGastosRoutingModule
  ]
})
export class ReembolsoGastosModule { }
