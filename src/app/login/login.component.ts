import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from '../services/toastr.service';
import { AppComponent } from '../app.component';
import { environment } from 'src/environments/environment';

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

  constructor(private fb: FormBuilder,
    private toastrService: ToastrService, 
    private renderer: Renderer2,
    private appComponent: AppComponent) { }

  ngOnInit() {
    this.CreateLoginForm();
    this.appComponent.setTitle('Login');
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('login-page');
    this.appName = environment.projectName;
    this.copyright = environment.copyrightLogin;
  }

  CreateLoginForm() {
    this.loginForm = this.fb.group({
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required]],
    });
  }

  iniciarSesion() {
    if (this.loginForm.valid) {
      window.location.href = 'home';
    } else {
      this.appComponent.validateAllFormFields(this.loginForm);
      this.toastrService.error('Error al iniciar sesión', 'No se llenaron todos los campos necesarios.');
    }
  }

}
