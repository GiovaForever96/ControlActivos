import { Component } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.css']
})
export class ResultadosComponent {
  constructor(  private appComponent: AppComponent) {
    this.appComponent.setTitle('Resultados');
   }
}
