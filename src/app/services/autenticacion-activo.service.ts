import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IInicioSesionActivo } from '../models/inicio-sesion-activo';
import axios from 'axios';
import { AuthService } from './auth-interceptor.service';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionActivoService {

  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'AuthActivo/';

  async iniciarSesion(inicioSesionData: IInicioSesionActivo): Promise<string> {
    const URL_API = this.baseUrl + 'login';
    try {
      const response = await axios.post<any>(URL_API, inicioSesionData);
      if (response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('nombreUsuario', response.data.fullName);
        localStorage.setItem('lastLogin', response.data.lastLogin);
        return "OK";
      } else {
        return response.data.mensaje;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_BAD_REQUEST') {
          return 'Usuario o contraseña incorrectos.';
        } else {
          return 'Ha ocurrido un error en el servidor. Contactese con TI.';
        }
      } else {
        return 'Ha ocurrido un error no reconocido. Contactese con TI.';
      }
    }
  }

}