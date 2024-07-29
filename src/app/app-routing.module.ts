import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaginaNoEncontradaComponent } from './pagina-no-encontrada/pagina-no-encontrada.component';
import { LoginComponent } from './login/login.component';
import { ConsultaInformacionComponent } from './consulta-informacion/consulta-informacion.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'iniciar-sesion', redirectTo: '', pathMatch: 'full' },
  { path: 'consulta-informacion', component: ConsultaInformacionComponent },
  // { path: 'home', loadChildren: () => import('./home/home-routing.module').then(m => m.HomeRoutingModule) },
  { path: '**', component: PaginaNoEncontradaComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
