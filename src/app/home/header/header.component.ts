import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-interceptor.service';

@Component({
  selector: 'nav[app-header]',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  currentUserPhoto: string;
  currentUserName: string;

  constructor(private router: Router) {
    this.currentUserName = "";
    this.currentUserPhoto = "";
  }

  ngOnInit() {
    this.currentUserPhoto = "";
    this.currentUserName = "Usuario";
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/'])
  }

}
