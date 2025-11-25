import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IEmpleadoActivo } from '../models/empleado-activo';
import axios from 'axios';
import { AuthService } from './auth-interceptor.service';

@Injectable({
  providedIn: 'root',
})
export class EmpleadoActivoService {
  constructor(private authService: AuthService) {}

  baseUrl = environment.apiUrl + 'EmpleadoActivo/';

  async obtenerEmpleados(): Promise<IEmpleadoActivo[]> {
    const URL_API = this.baseUrl + 'obtenerEmpleados';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IEmpleadoActivo[];
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

  async insertarEmpleado(data: FormData): Promise<string> {
    const URL_API = this.baseUrl + 'agregarEmpleado';
    try {
      const response = await this.authService.apiClient.post<any>(
        URL_API,
        data
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

  async actualizarEmpleado(
    cedulaEmpleado: string,
    dataActualizado: FormData
  ): Promise<string> {
    const URL_API = this.baseUrl + 'actualizarEmpleado/' + cedulaEmpleado;
    try {
      const response = await this.authService.apiClient.put<any>(
        URL_API,
        dataActualizado
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

  async eliminarEmpleado(cedulaEmpleado: string): Promise<string> {
    const URL_API = this.baseUrl + 'eliminarEmpleado/' + cedulaEmpleado;
    try {
      const response = await this.authService.apiClient.delete<any>(URL_API);
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
}
