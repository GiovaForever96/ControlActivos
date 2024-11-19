import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PresupuestosRoutingModule } from './presupuestos-routing.module';
import { PresupuestosComponent } from './presupuestos.component';
import { PlancuentasComponent } from './plancuentas/plancuentas.component';
import { PresupuestoComponent } from './presupuesto/presupuesto.component';
import { ResultadosComponent } from './resultados/resultados.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TreeTableModule } from 'primeng/treetable';


@NgModule({
  declarations: [
    PresupuestosComponent,
    PlancuentasComponent,
    PresupuestoComponent,
    ResultadosComponent
  ],
  imports: [
    CommonModule,
    PresupuestosRoutingModule,FormsModule,
    ReactiveFormsModule,
    TreeTableModule
  ]
})
export class PresupuestosModule { }
