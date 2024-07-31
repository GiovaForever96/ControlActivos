import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
    this.currentUserName = "Giovanni Rivera";
  }

  cerrarSesion() {
    this.router.navigate(['/'])
  }


}
