import { Injectable } from '@angular/core';
import { AuthService } from './auth-interceptor.service';
import { environment } from 'src/environments/environment';
import { IPlanCuentas } from '../models/plan-cuentas';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class PlanCuentasService {

  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'PlanCuentas/';

  async obtenerPlanCuentas(): Promise<IPlanCuentas[]> {
    const URL_API = this.baseUrl + 'obtenerPlanCuentas';
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

  async obtenerPlanCuentasArbol(): Promise<any> {
    const URL_API = this.baseUrl + 'obtenerPlanCuentasArbol';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as [];
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

  async obtenerPlanCuentasPresupuesto(): Promise<IPlanCuentas[]> {
    const URL_API = this.baseUrl + 'obtenerCuentasFinalPlanPresupuesto';
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

  async insertarPlan(planData: IPlanCuentas): Promise<string> {
    const URL_API = this.baseUrl + 'agregarCuentaPlan';
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, planData);
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

  async actualizarPlan(id_plan: number, planActualizado: IPlanCuentas): Promise<string> {
    const URL_API = `${this.baseUrl}actualizarCuentaPlan/${id_plan}`;
    try {
      const response = await this.authService.apiClient.put<any>(URL_API, planActualizado);
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

  async obtenerAniosValidos(): Promise<IPlanCuentas[]> {
    const URL_API = this.baseUrl + 'obtenerAniosValidos';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as any[];
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
