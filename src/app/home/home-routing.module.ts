import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { IndexComponent } from './index/index.component';
import { MarcasComponent } from './marcas/marcas.component';
import { ModelosComponent } from './modelos/modelos.component';
import { CustodiosComponent } from './custodios/custodios.component';
import { ActivosComponent } from './activos/activos.component';
import { InventarioComponent } from './inventario/inventario.component';
import { DepartamentosComponent } from './departamentos/departamentos.component';
import { CargosComponent } from './cargos/cargos.component';
import { SucursalesComponent } from './sucursales/sucursales.component';
import { EmpleadosComponent } from './empleados/empleados.component';

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
      { path: 'departamentos', component: DepartamentosComponent },
      { path: 'cargos', component: CargosComponent },
      { path: 'sucursales', component: SucursalesComponent },
      { path: 'empleados', component: EmpleadosComponent},
      { path: 'presupuestos', loadChildren: () => import('./presupuestos/presupuestos.module').then(m => m.PresupuestosModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(homeRoutes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }