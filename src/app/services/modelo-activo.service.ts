import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import { IModeloActivo } from '../models/modelo-activo';
import { AuthService } from './auth-interceptor.service';

@Injectable({
  providedIn: 'root'
})
export class ModeloActivoService {

  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'ModeloActivo/';

  async obtenerModelos(): Promise<IModeloActivo[]> {
    const URL_API = this.baseUrl + 'obtenerModelos';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IModeloActivo[];
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

  async insertarModelo(modeloData: IModeloActivo): Promise<string> {
    const URL_API = this.baseUrl + 'agregarModelo';
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, modeloData);
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

  async actualizarModelo(idModelo: number, modeloActualizado: IModeloActivo): Promise<string> {
    const URL_API = `${this.baseUrl}actualizarModelo/${idModelo}`;
    try {
      const response = await this.authService.apiClient.put<any>(URL_API, modeloActualizado);
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

  async eliminarModelo(idModelo: number): Promise<string> {
    const URL_API = `${this.baseUrl}eliminarModelo/${idModelo}`;
    try {
      const response = await this.authService.apiClient.delete<any>(URL_API);
      if (!response.data.esError) {
        return 'Modelo eliminado exitosamente';
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
