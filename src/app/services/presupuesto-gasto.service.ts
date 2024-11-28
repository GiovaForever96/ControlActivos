import { Injectable } from '@angular/core';
import { AuthService } from './auth-interceptor.service';
import { environment } from 'src/environments/environment';
import { IGastoMensual, IGastosRespuesta, IMesGasto } from '../models/presupuesto-gastos';
import axios from 'axios';
import { IGastoPresupuesto, IPlanCuentasPresupuesto } from '../models/plan-cuentas';

@Injectable({
  providedIn: 'root'
})
export class PresupuestoGastoService {

  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'PresupuestoPlan/';

  async obtenerMesGastoPendientes(anio:number): Promise<IMesGasto[]> {
    const URL_API = this.baseUrl + 'obtenerMesGastoPendientes/'+anio;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IMesGasto[];
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

  async obtenerGastosPresupuestoPlanCuenta(anio:number): Promise<IGastosRespuesta> {
    const URL_API = this.baseUrl + 'obtenerGastosPresupuestoPlanCuenta/'+anio;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IGastosRespuesta;
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

  async agregarGastoMensual(planData: IGastoMensual[]): Promise<string> {
    const URL_API = this.baseUrl + 'agregargastoMensual';
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

  async agregarPresupuestoAnual(presupuestoData: IPlanCuentasPresupuesto[]): Promise<string> {
    const URL_API = this.baseUrl + 'agregarPresupuestoAnual';
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, presupuestoData);
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

  async actualizarValorGastoPresupuesto(gastoPresupuesto: IGastoPresupuesto,tipo:number): Promise<string> {
    const URL_API = this.baseUrl + 'actualizarValorGastoPresupuesto/'+tipo;
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, gastoPresupuesto);
      if (!response.data.esError) {
        return response.data.mensaje;
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error('Ha ocurrido un error en el servidor.\nContactese con TI.'+error);
      } else {
        throw new Error('Ha ocurrido un error no reconocido.\nContactese con TI.'+error);
      }
    }
  }

  async verificarExistePresupuestoCargado(anio:number): Promise<any> {
    const URL_API = this.baseUrl + 'verificarExistePresupuestoCargado/'+anio;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as any;
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

  async obtenerPresupuestoCuentaPlanAnual(anio:number): Promise<IPlanCuentasPresupuesto[]> {
    const URL_API = this.baseUrl + 'obtenerPresupuestoCuentaPlanAnual/'+anio;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IPlanCuentasPresupuesto[];
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
