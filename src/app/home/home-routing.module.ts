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
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { BienesComponent } from './bienes/bienes.component';
import { AuthGuard, RoleGuard } from '../guards/auth.guard';

const homeRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'index', component: IndexComponent },
      { path: '', redirectTo: 'index', pathMatch: 'full' },

      // Nómina
      {
        path: 'departamentos',
        component: DepartamentosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ACT', 'RH'] }
      },
      {
        path: 'cargos',
        component: CargosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ACT', 'RH'] }
      },
      {
        path: 'sucursales',
        component: SucursalesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ACT', 'RH'] }
      },
      {
        path: 'empleados',
        component: EmpleadosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ACT', 'RH', 'FIN', 'PRES'] }
      },

      // Control de activos
      {
        path: 'marcas',
        component: MarcasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['FIN', 'ACT', 'PRES'] }
      },
      {
        path: 'modelos',
        component: ModelosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['FIN', 'ACT', 'PRES'] }
      },
      {
        path: 'custodios',
        component: CustodiosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['FIN', 'ACT', 'PRES'] }
      },
      {
        path: 'proveedores',
        component: ProveedoresComponent,
        canActivate: [RoleGuard],
        data: { roles: ['FIN', 'ACT', 'PRES'] }
      },
      {
        path: 'bienes',
        component: BienesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['FIN', 'ACT', 'PRES'] }
      },
      {
        path: 'activos',
        component: ActivosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['FIN', 'ACT', 'PRES'] }
      },
      {
        path: 'inventario',
        component: InventarioComponent,
        canActivate: [RoleGuard],
        data: { roles: ['FIN', 'ACT', 'PRES'] }
      },

      // Presupuestos
      {
        path: 'presupuestos',
        loadChildren: () =>
          import('./presupuestos/presupuestos.module').then(m => m.PresupuestosModule),
        canActivate: [RoleGuard],
        data: { roles: ['FIN', 'PRES'] }
      },

      // Reembolsos
      {
        path: 'reembolsos',
        loadChildren: () =>
          import('./reembolso-gastos/reembolso-gastos.module').then(m => m.ReembolsoGastosModule),
        canActivate: [RoleGuard],
        data: { roles: ['FIN', 'PRES'] }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(homeRoutes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }