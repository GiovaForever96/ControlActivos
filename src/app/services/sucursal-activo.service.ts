import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ISucursalActivo } from '../models/sucursal-activo';
import axios from 'axios';
import { AuthService } from './auth-interceptor.service';

@Injectable({
  providedIn: 'root',
})
export class SucursalActivoService {
  constructor(private authService: AuthService) {}
  baseUrl = environment.apiUrl + 'SucursalActivo/';

  async obtenerSucursales(): Promise<ISucursalActivo[]> {
    const URL_API = this.baseUrl + 'obtenerSucursales';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as ISucursalActivo[];
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage =
          error.response?.data?.mensaje ||
          'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }

  async insertarSucursal(sucursalData: ISucursalActivo): Promise<string> {
    const URL_API = this.baseUrl + 'agregarSucursal';
    try {
      const response = await this.authService.apiClient.post<any>(
        URL_API,
        sucursalData
      );
      if (!response.data.esError) {
        return response.data.mensaje;
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage =
          error.response?.data?.mensaje ||
          'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }

  async actualizarSucursal(
    idSucursal: number,
    sucursalActualizado: ISucursalActivo
  ): Promise<string> {
    const URL_API = `${this.baseUrl}actualizarSucursal/${idSucursal}`;
    try {
      const response = await this.authService.apiClient.put<any>(
        URL_API,
        sucursalActualizado
      );
      if (!response.data.esError) {
        return response.data.mensaje;
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage =
          error.response?.data?.mensaje ||
          'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }

  async eliminarSucursal(idSucursal: number): Promise<string> {
    const URL_API = `${this.baseUrl}eliminarSucursal/${idSucursal}`;
    try {
      const response = await this.authService.apiClient.delete<any>(URL_API);
      if (!response.data.esError) {
        return 'Sucursal eliminada exitosamente';
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage =
          error.response?.data?.mensaje ||
          'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }
}
