import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PresupuestosComponent } from './presupuestos.component';
import { IndexComponent } from '../index/index.component';
import { PlancuentasComponent } from './plancuentas/plancuentas.component';
import { ResultadosComponent } from './resultados/resultados.component';
import { PresupuestoComponent } from './presupuesto/presupuesto.component';

const homeRoutes: Routes = [
  {
    path: '',
    component: PresupuestosComponent,
    children: [
      { path: 'index', component: IndexComponent },
      { path: '', redirectTo: 'index', pathMatch: 'full' },
      { path: 'planCuentas', component: PlancuentasComponent },
      { path: 'presupuesto', component: PresupuestoComponent },
      { path: 'resultados', component: ResultadosComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(homeRoutes)],
  exports: [RouterModule]
})
export class PresupuestosRoutingModule { }