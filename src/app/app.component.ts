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
      { id: 1, nombre: 'Enero', seleccionado: false }, { id: 2, nombre: 'Febrero', seleccionado: false }, { id: 3, nombre: 'Marzo', seleccionado: false }, { id: 4, nombre: 'Abril', seleccionado: false },
      { id: 5, nombre: 'Mayo', seleccionado: false }, { id: 6, nombre: 'Junio', seleccionado: false }, { id: 7, nombre: 'Julio', seleccionado: false }, { id: 8, nombre: 'Agosto', seleccionado: false },
      { id: 9, nombre: 'Septiembre', seleccionado: false }, { id: 10, nombre: 'Octubre', seleccionado: false }, { id: 11, nombre: 'Noviembre', seleccionado: false }, { id: 12, nombre: 'Diciembre', seleccionado: false },
    ];
  }

  soloNumeros(event: KeyboardEvent): void {
    const key = event.key;
    if (!/^\d+$/.test(key)) {
      event.preventDefault();
    }
  }

  soloDecimal(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^\d+$/.test(key)) {
      if (key === '.' && !input.value.includes('.')) {
        return;
      }
      event.preventDefault();
    }
  }

  soloLetras(event: KeyboardEvent) {
    const key = event.key;
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(key);
  }

  esCedulaValida(cedula: string): boolean {
    if (!cedula || cedula.length !== 10) {
      return false;
    }
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) {
      return false;
    }
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < coeficientes.length; i++) {
      let valor = parseInt(cedula[i]) * coeficientes[i];
      if (valor > 9) { valor -= 9; }
      suma += valor;
    }
    const digitoVerificador = parseInt(cedula[9]);
    const residuo = suma % 10;
    const resultado = residuo === 0 ? 0 : 10 - residuo;
    return resultado === digitoVerificador;
  }

  formatearFechaCorta(fecha: string): string {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  formatearFecha(fecha: Date | string): string {
    const date = new Date(fecha);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

}
