import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IMarcaActivo } from '../models/marca-activo';
import axios from 'axios';
import { AuthService } from './auth-interceptor.service';

@Injectable({
  providedIn: 'root'
})
export class MarcaActivoService {

  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'MarcaActivo/';

  async obtenerMarcas(): Promise<IMarcaActivo[]> {
    const URL_API = this.baseUrl + 'obtenerMarcas';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IMarcaActivo[];
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.mensaje || 'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }

  async insertarMarca(marcaData: IMarcaActivo): Promise<string> {
    const URL_API = this.baseUrl + 'agregarMarca';
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, marcaData);
      if (!response.data.esError) {
        return response.data.mensaje;
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.mensaje || 'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }

  async actualizarMarca(idMarca: number, marcaActualizado: IMarcaActivo): Promise<string> {
    const URL_API = `${this.baseUrl}actualizarMarca/${idMarca}`;
    try {
      const response = await this.authService.apiClient.put<any>(URL_API, marcaActualizado);
      if (!response.data.esError) {
        return response.data.mensaje;
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.mensaje || 'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }

  async eliminarMarca(idMarca: number): Promise<string> {
    const URL_API = `${this.baseUrl}eliminarMarca/${idMarca}`;
    try {
      const response = await this.authService.apiClient.delete<any>(URL_API);
      if (!response.data.esError) {
        return 'Marca eliminada exitosamente';
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.mensaje || 'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }

}
