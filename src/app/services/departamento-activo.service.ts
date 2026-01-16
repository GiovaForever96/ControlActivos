import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDepartamentoActivo } from '../models/departamento-activo';
import axios from 'axios';
import { AuthService } from './auth-interceptor.service';

@Injectable({
  providedIn: 'root',
})
export class DepartamentoActivoService {
  constructor(private authService: AuthService) { }
  baseUrl = environment.apiUrl + 'DepartamentoActivo/';

  async obtenerDepartamentos(): Promise<IDepartamentoActivo[]> {
    const URL_API = this.baseUrl + 'obtenerDepartamentos';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IDepartamentoActivo[];
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

  async insertarDepartamento(
    departamentoData: IDepartamentoActivo
  ): Promise<string> {
    const URL_API = this.baseUrl + 'agregarDepartamento';
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, departamentoData);
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

  async actualizarDepartamento(idDepartamento: number, departamentoActualizado: IDepartamentoActivo): Promise<string> {
    const URL_API = `${this.baseUrl}actualizarDepartamento/${idDepartamento}`;
    try {
      const response = await this.authService.apiClient.put<any>(URL_API, departamentoActualizado);
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

  async eliminarDepartamento(idDepartamento: number): Promise<string> {
    const URL_API = `${this.baseUrl}eliminarDepartamento/${idDepartamento}`;
    try {
      const response = await this.authService.apiClient.delete<any>(URL_API);
      if (!response.data.esError) {
        return 'Departamento eliminado exitosamente';
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
