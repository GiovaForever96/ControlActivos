import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from '../index/index.component';
import { ReembolsoGastosComponent } from './reembolso-gastos.component';
import { IngresoReembolsoComponent } from './ingreso-reembolso/ingreso-reembolso.component';

const homeRoutes: Routes = [
  {
    path: '',
    component: ReembolsoGastosComponent,
    children: [
      { path: 'index', component: IndexComponent },
      { path: '', redirectTo: 'index', pathMatch: 'full' },
      { path: 'ingreso', component: IngresoReembolsoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(homeRoutes)],
  exports: [RouterModule]
})
export class ReembolsoGastosRoutingModule { }
