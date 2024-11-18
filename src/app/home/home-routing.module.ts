import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { IndexComponent } from './index/index.component';
import { MarcasComponent } from './marcas/marcas.component';
import { ModelosComponent } from './modelos/modelos.component';
import { CustodiosComponent } from './custodios/custodios.component';
import { ActivosComponent } from './activos/activos.component';
import { InventarioComponent } from './inventario/inventario.component';

const homeRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'index', component: IndexComponent },
      { path: '', redirectTo: 'index', pathMatch: 'full' },
      { path: 'marcas', component: MarcasComponent },
      { path: 'modelos', component: ModelosComponent },
      { path: 'custodios', component: CustodiosComponent },
      { path: 'bienes', component: ActivosComponent },
      { path: 'inventario', component: InventarioComponent },
      { path: 'presupuestos', loadChildren: () => import('./presupuestos/presupuestos.module').then(m => m.PresupuestosModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(homeRoutes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }