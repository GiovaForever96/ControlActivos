import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PresupuestosRoutingModule } from './presupuestos-routing.module';
import { PresupuestosComponent } from './presupuestos.component';
import { PlancuentasComponent } from './plancuentas/plancuentas.component';
import { PresupuestoComponent } from './presupuesto/presupuesto.component';
import { ResultadosComponent } from './resultados/resultados.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TreeTableModule } from 'primeng/treetable';

import {TableModule} from 'primeng/table';
import {ToastModule} from 'primeng/toast';
import {CalendarModule} from 'primeng/calendar';
import {SliderModule} from 'primeng/slider';
import {MultiSelectModule} from 'primeng/multiselect';
import {ContextMenuModule} from 'primeng/contextmenu';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {ProgressBarModule} from 'primeng/progressbar';
import {InputTextModule} from 'primeng/inputtext';
import { IndicadoresComponent } from './indicadores/indicadores.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    PresupuestosComponent,
    PlancuentasComponent,
    PresupuestoComponent,
    ResultadosComponent,
    IndicadoresComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    PresupuestosRoutingModule,FormsModule,
    ReactiveFormsModule,
    TreeTableModule,
    TableModule,
    ToastModule,
    CalendarModule,
    SliderModule,
    MultiSelectModule,
    ContextMenuModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    ProgressBarModule,
    InputTextModule
  ]
})
export class PresupuestosModule { }
