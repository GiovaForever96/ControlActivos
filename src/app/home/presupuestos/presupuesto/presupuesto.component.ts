import { Component } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.component.html',
  styleUrls: ['./presupuesto.component.css']
})
export class PresupuestoComponent {
  constructor(  private appComponent: AppComponent) {
    this.appComponent.setTitle('Presupuesto');
   }
}
