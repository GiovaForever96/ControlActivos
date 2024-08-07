import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaginaNoEncontradaComponent } from './pagina-no-encontrada/pagina-no-encontrada.component';
import { LoginComponent } from './login/login.component';
import { ConsultaInformacionComponent } from './consulta-informacion/consulta-informacion.component';
import { RegistroInventarioComponent } from './registro-inventario/registro-inventario.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'iniciar-sesion', redirectTo: '', pathMatch: 'full' },
  { path: 'consulta-informacion', component: ConsultaInformacionComponent },
  { path: 'consulta-informacion/:idProducto', component: ConsultaInformacionComponent },
  { path: 'registro-inventario', component: RegistroInventarioComponent },
  { path: 'home', loadChildren: () => import('./home/home-routing.module').then(m => m.HomeRoutingModule), canActivate: [AuthGuard] },
  { path: '**', component: PaginaNoEncontradaComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
