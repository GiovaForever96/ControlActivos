import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public constructor(private titleService: Title) { }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle + ' | ' + environment.projectName);
  }

  public validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  public formatoDinero(valor: number, esDinero: boolean): string {
    if (typeof (valor) == 'string')
      valor = Number(valor);
    if (valor) {
      const valorFormateado = valor.toLocaleString('es-ES', { minimumFractionDigits: 2 });
      return (esDinero ? '$' : '') + valorFormateado;
    } else {
      return (esDinero ? '$' : '') + '0.00';
    }
  }

  obtenerOGenerarIdentificador(): string {
    const identificador = localStorage.getItem('identificadorUnico');
    if (identificador) {
      return identificador;
    } else {
      const nuevoIdentificador = uuidv4();
      localStorage.setItem('identificadorUnico', nuevoIdentificador);
      return nuevoIdentificador;
    }
  }

  obtenerMesesAnio(): any {
    return [
      { id: 1, nombre: 'Enero' }, { id: 2, nombre: 'Febrero' }, { id: 3, nombre: 'Marzo' }, { id: 4, nombre: 'Abril' },
      { id: 5, nombre: 'Mayo' }, { id: 6, nombre: 'Junio' }, { id: 7, nombre: 'Julio' }, { id: 8, nombre: 'Agosto' },
      { id: 9, nombre: 'Septiembre' }, { id: 10, nombre: 'Octubre' }, { id: 11, nombre: 'Noviembre' }, { id: 12, nombre: 'Diciembre' },
    ];
  }

}
