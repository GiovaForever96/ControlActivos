import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDocumentoEmpleado, IEmpleadoActivo, IInformacionEmpleado, IListarDocumentosResponse } from '../models/empleado-activo';
import axios from 'axios';
import { AuthService } from './auth-interceptor.service';

@Injectable({
  providedIn: 'root',
})
export class EmpleadoActivoService {
  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'EmpleadoActivo/';
  baseUrlSS = environment.apiSegurosSuarez;

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
      const response = await this.authService.apiClient.post<any>(URL_API, data);
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

  async actualizarEmpleado(cedulaEmpleado: string, dataActualizado: FormData): Promise<string> {
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

  async generarDocumentosEmpleado(informacionEmpleado: IInformacionEmpleado): Promise<string> {
    const URL_API = this.baseUrlSS + 'generarDocumentosEmpleado';
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, informacionEmpleado);
      if (response.data.ok) {
        return response.data.message;
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

  async listarDocumentosEmpleado(cedula: string): Promise<IListarDocumentosResponse> {
    const URL_API = this.baseUrlSS + 'listarDocumentosEmpleado/' + cedula;

    try {
      const response = await this.authService.apiClient.get<any>(URL_API);

      if (response.data.ok) {
        return {
          ok: true,
          documentos: (response.data.documentos ?? []) as IDocumentoEmpleado[],
          zip: response.data.zip ?? { nombre: '', url: null }
        };
      } else {
        throw new Error(response.data.message || response.data.mensaje || 'Error listando documentos');
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage =
          error.response?.data?.message ||
          error.response?.data?.mensaje ||
          'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(serverMessage);
      } else {
        throw new Error(`${(error as any)?.message ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }


}
