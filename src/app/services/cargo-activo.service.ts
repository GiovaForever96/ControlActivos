import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ICargoActivo } from '../models/cargo-activo';
import axios from 'axios';
import { AuthService } from './auth-interceptor.service';

@Injectable({
  providedIn: 'root',
})
export class CargoActivoService {
  constructor(private authService: AuthService) { }
  baseUrl = environment.apiUrl + 'CargoActivo/';

  async obtenerCargos(): Promise<ICargoActivo[]> {
    const URL_API = this.baseUrl + 'obtenerCargos';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as ICargoActivo[];
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

  async insertarCargo(cargoData: ICargoActivo): Promise<string> {
    const URL_API = this.baseUrl + 'agregarCargo';
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, cargoData);
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

  async actualizarCargo(idCargo: number, cargoActualizado: ICargoActivo): Promise<string> {
    const URL_API = `${this.baseUrl}actualizarCargo/${idCargo}`;
    try {
      const response = await this.authService.apiClient.put<any>(URL_API, cargoActualizado);
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

  async eliminarCargo(idCargo: number): Promise<string> {
    const URL_API = `${this.baseUrl}eliminarCargo/${idCargo}`;
    try {
      const response = await this.authService.apiClient.delete<any>(URL_API);
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
}
