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
      const response = await this.authService.apiClient.post<any>(URL_API, inicioSesionData);
      if (!response.data.esError) {
        localStorage.setItem('token', response.data.token);
        return "Inicio de sesión exitoso";
      } else {
        return `Error: ${response.data.mensaje}`;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code == "ERR_BAD_REQUEST")
          throw new Error('Usuario o contraseña incorrectos.');
        else
          throw new Error('Ha ocurrido un error en el servidor.\nContactese con TI.');
      } else {
        throw new Error('Ha ocurrido un error no reconocido.\nContactese con TI.');
      }
    }
  }

}