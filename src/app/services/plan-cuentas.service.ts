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
        throw new Error('Ha ocurrido un error en el servidor.\nContactese con TI.');
      } else {
        throw new Error('Ha ocurrido un error no reconocido.\nContactese con TI.');
      }
    }
  }


  async insertarPlan(planData: IPlanCuentas): Promise<string> {
    const URL_API = this.baseUrl + 'agregarMarca';
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, planData);
      if (!response.data.esError) {
        return response.data.mensaje;
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error('Ha ocurrido un error en el servidor.\nContactese con TI.');
      } else {
        throw new Error('Ha ocurrido un error no reconocido.\nContactese con TI.');
      }
    }
  }

  async actualizarPlan(id_plan: number, planActualizado: IPlanCuentas): Promise<string> {
    const URL_API = `${this.baseUrl}actualizarMarca/${id_plan}`;
    try {
      const response = await this.authService.apiClient.put<any>(URL_API, planActualizado);
      if (!response.data.esError) {
        return response.data.mensaje;
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error('Ha ocurrido un error en el servidor.\nContactese con TI.');
      } else {
        throw new Error('Ha ocurrido un error no reconocido.\nContactese con TI.');
      }
    }
  }

}
