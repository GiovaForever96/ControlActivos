import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from '../services/toastr.service';
import { AppComponent } from '../app.component';
import { environment } from 'src/environments/environment';
import { AutenticacionActivoService } from '../services/autenticacion-activo.service';
import { IInicioSesionActivo } from '../models/inicio-sesion-activo';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup = new FormGroup({});
  model: any = {};
  appName: any;
  copyright: any;
  identificadorUnico: string = '';

  constructor(private fb: FormBuilder,
    private toastrService: ToastrService,
    private autenticacionService: AutenticacionActivoService,
    private appComponent: AppComponent) { }

  ngOnInit() {
    this.CreateLoginForm();
    this.appComponent.setTitle('Ingreso');
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('login-page');
    this.appName = environment.projectName;
    this.copyright = environment.copyrightLogin;
    this.identificadorUnico = this.appComponent.obtenerOGenerarIdentificador();
  }

  CreateLoginForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  async iniciarSesion() {
    let swalInstance: any;

    try {
      if (this.loginForm.valid) {
        swalInstance = Swal.fire({
          title: 'Verificando credenciales...',
          text: 'Por favor, espere mientras se procesa la solicitud.',
          icon: 'info',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const inicioSesionData: IInicioSesionActivo = this.loginForm.value;
        inicioSesionData.platformId = environment.idPlatform;
        let respuestaAutenticacion = await this.autenticacionService.iniciarSesion(inicioSesionData);
        if (respuestaAutenticacion == "OK")
          window.location.href = 'home';
        else
          this.toastrService.error("Error inicio sesión", respuestaAutenticacion);
      } else {
        this.appComponent.validateAllFormFields(this.loginForm);
        this.toastrService.error('Error al iniciar sesión', 'No se llenaron todos los campos necesarios.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al iniciar sesión', error.message);
      } else {
        this.toastrService.error('Error al iniciar sesión', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      if (swalInstance) {
        swalInstance.close();
      }
    }
  }

}
