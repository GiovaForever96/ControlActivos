import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IProveedorActivo } from '../models/proveedor-activo';
import axios from 'axios';
import { AuthService } from './auth-interceptor.service';

@Injectable({
  providedIn: 'root',
})
export class ProveedorActivoService {
  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'ProveedorActivo/';
  rucUrl = environment.apiUrlRuc;
  segurossuarezUrl = environment.apiSegurosSuarez;

  async obtenerProveedores(): Promise<IProveedorActivo[]> {
    const URL_API = this.baseUrl + 'obtenerProveedores';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IProveedorActivo[];
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

  async insertarProveedor(proveedorData: IProveedorActivo): Promise<string> {
    const URL_API = this.baseUrl + 'agregarProveedor';
    try {
      const response = await this.authService.apiClient.post<any>(
        URL_API,
        proveedorData
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

  async actualizarProveedor(
    rucProveedor: string,
    proveedorActualizado: IProveedorActivo): Promise<string> {
    const URL_API = `${this.baseUrl}actualizarProveedor/${rucProveedor}`;
    try {
      const response = await this.authService.apiClient.put<any>(
        URL_API,
        proveedorActualizado
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

  async eliminarProveedor(rucProveedor: string): Promise<string> {
    const URL_API = `${this.baseUrl}eliminarProveedor/${rucProveedor}`;
    try {
      const response = await this.authService.apiClient.delete<any>(URL_API);
      if (!response.data.esError) {
        return 'Proveedor eliminado exitosamente';
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

  async obtenerProvinciasCantones(): Promise<any> {
    const URL_API = this.segurossuarezUrl;
    try {
      const response = await this.authService.apiClient.get<any>(
        `${URL_API}/getProvinciasCantonesRed`
      );
      if (!response.data.esError) {
        return response.data.data;
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

  async obtenerInformacionRuc(rucProveedor: string): Promise<any> {
    const URL_API = this.rucUrl + 'consultarInformacionRUCSRI';
    try {
      const response = await this.authService.apiClient.post<any>(
        URL_API, { identificacion: rucProveedor, actualizar: 0, usuario: 'ACTIVOS', ipConsulta: '190.95.194.202' }
      );
      if (!response.data.esError) {
        return response.data.resultado;
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
