import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ICustodioActivo, ISucursalActivo } from '../models/custodio-activo';
import axios from 'axios';
import { AuthService } from './auth-interceptor.service';

@Injectable({
  providedIn: 'root'
})
export class CustodioActivoService {

  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'CustodioActivo/';
  baseUrlSucursal = environment.apiUrl + 'SucursalActivo/';
  baseUrlProductoCustodio = environment.apiUrl + 'ProductoCustodioActivo/';

  async obtenerInformacionProductoCustodio(): Promise<ICustodioActivo[]> {
    const URL_API = `${this.baseUrl}obtenerCustodios`;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as ICustodioActivo[];
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

  async obtenerCustodios(): Promise<ICustodioActivo[]> {
    const URL_API = this.baseUrl + 'obtenerCustodios';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as ICustodioActivo[];
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

  async insertarCustodio(custodioData: ICustodioActivo): Promise<string> {
    const URL_API = this.baseUrl + 'agregarCustodio';
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, custodioData);
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

  async actualizarCustodio(idCustodio: number, custodioActualizado: ICustodioActivo): Promise<string> {
    const URL_API = `${this.baseUrl}actualizarCustodio/${idCustodio}`;
    try {
      const response = await this.authService.apiClient.put<any>(URL_API, custodioActualizado);
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

  async eliminarCustodio(idCustodio: number): Promise<string> {
    const URL_API = `${this.baseUrl}eliminarCustodio/${idCustodio}`;
    try {
      const response = await this.authService.apiClient.delete<any>(URL_API);
      if (!response.data.esError) {
        return 'Custodio eliminado exitosamente';
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

  async obtenerSucursales(): Promise<ISucursalActivo[]> {
    const URL_API = this.baseUrlSucursal + 'obtenerSucursales';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as ISucursalActivo[];
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