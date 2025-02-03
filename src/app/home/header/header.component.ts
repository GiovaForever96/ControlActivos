import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-interceptor.service';

@Component({
  selector: 'nav[app-header]',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  currentUserPhoto: string = "";
  nombreUsuario: string = "";
  ultimoInicioSesion: string = "";

  constructor(private router: Router) { }

  ngOnInit() {
    this.nombreUsuario = localStorage.getItem("nombreUsuario") ?? "";
    this.ultimoInicioSesion = localStorage.getItem("lastLogin") ?? "";
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('lastLogin');
    localStorage.removeItem('roles');
    localStorage.removeItem('userName');
    localStorage.removeItem('indicadoresFinancieros');
    this.router.navigate(['/'])
  }

}
