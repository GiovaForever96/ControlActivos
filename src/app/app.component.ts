import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

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

}
