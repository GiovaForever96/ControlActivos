import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IActualizacionContrasenia, IInicioSesionActivo } from '../models/inicio-sesion-activo';
import axios from 'axios';
import { AuthService } from './auth-interceptor.service';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionActivoService {

  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'AuthActivo/';
  baseUrlUsuario = environment.apiUrl + 'UsuarioActivo/';

  async iniciarSesion(inicioSesionData: IInicioSesionActivo): Promise<string> {
    const URL_API = this.baseUrl + 'login';
    try {
      const response = await axios.post<any>(URL_API, inicioSesionData);
      if (response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('nombreUsuario', response.data.fullName);
        localStorage.setItem('lastLogin', response.data.lastLogin);
        localStorage.setItem('roles', response.data.roles);
        localStorage.setItem('userName', inicioSesionData.username);
        localStorage.setItem('indicadoresFinancieros', response.data.indicadoresFinancieros);
        localStorage.setItem('actualizarContrasenia', response.data.actualizarContrasenia);
        return "OK";
      } else {
        return response.data.mensaje;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_BAD_REQUEST') {
          return error.response?.data.message ?? 'Ha ocurrido un error en el servidor. Contactese con TI.';
        } else {
          return 'Ha ocurrido un error en el servidor. Contactese con TI.';
        }
      } else {
        return 'Ha ocurrido un error no reconocido. Contactese con TI.';
      }
    }
  }

  async actualizarContrasenia(cambioContraseniaData: IActualizacionContrasenia): Promise<string> {
    const URL_API = this.baseUrlUsuario + 'update-credentials';
    try {
      const response = await axios.put<any>(URL_API, cambioContraseniaData);
      if (response.data) {
        return "OK";
      } else {
        return response.data.mensaje;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_BAD_REQUEST') {
          return error.response?.data.message ?? 'Ha ocurrido un error en el servidor. Contactese con TI.';
        } else {
          return 'Ha ocurrido un error en el servidor. Contactese con TI.';
        }
      } else {
        return 'Ha ocurrido un error no reconocido. Contactese con TI.';
      }
    }
  }

}