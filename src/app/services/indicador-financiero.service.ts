import { Injectable } from '@angular/core';
import { AuthService } from './auth-interceptor.service';
import { environment } from 'src/environments/environment';
import { IIndicadorFinanciero, IPlanCuentas } from '../models/plan-cuentas';
import axios from 'axios';
import { IGastosRespuesta } from '../models/presupuesto-gastos';

@Injectable({
  providedIn: 'root'
})
export class IndicadorFinancieroService {

  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'IndicadoresFinancieros/';

  async obtenerIndicadoresFinancieros(esParaGasto:number): Promise<IPlanCuentas[]> {
    const URL_API = `${this.baseUrl}obtenerIndicadoresFinancieros/${esParaGasto}`;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IPlanCuentas[];
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

  async obtenerValorIndicadorFinanciero(anio: number): Promise<IGastosRespuesta> {
    const URL_API = this.baseUrl + 'obtenerValorIndicadorFinanciero/' + anio;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IGastosRespuesta;
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

  async obtenerValorIndicadoresFinancieros(anio: number, mes: number): Promise<IIndicadorFinanciero[]> {
    const URL_API = `${this.baseUrl}obtenerValorIndicadoresFinanciero/${anio}/${mes}`;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IIndicadorFinanciero[];
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

  async agregarValorIndicadoresFinancieros(lstIndicadoresFinancieros: IIndicadorFinanciero[]): Promise<string> {
    const URL_API = `${this.baseUrl}agregarValorIndicadoresFinancieros`;
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, lstIndicadoresFinancieros);
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

  async actualizarValorIndicadoresFinancieros(lstIndicadoresFinancieros: IIndicadorFinanciero[]): Promise<string> {
    const URL_API = `${this.baseUrl}actualizarValorIndicadoresFinancieros`;
    try {
      const response = await this.authService.apiClient.put<any>(URL_API, lstIndicadoresFinancieros);
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
