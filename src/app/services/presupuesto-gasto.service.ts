import { Injectable } from '@angular/core';
import { AuthService } from './auth-interceptor.service';
import { environment } from 'src/environments/environment';
import { IGastoMensual, IGastosRespuesta, IInformacionGastoPresupuestoGrafico, IInformacionGastoPresupuestoMesCuentaGrafico, IMesGasto } from '../models/presupuesto-gastos';
import axios from 'axios';
import { IGastoPresupuesto, IHistorialGastoPresupuesto, IPlanCuentasPresupuesto } from '../models/plan-cuentas';

@Injectable({
  providedIn: 'root'
})
export class PresupuestoGastoService {

  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'PresupuestoPlan/';

  async obtenerMesGastoPendientes(anio: number): Promise<IMesGasto[]> {
    const URL_API = this.baseUrl + 'obtenerMesGastoPendientes/' + anio;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IMesGasto[];
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

  async obtenerGastosPresupuestoPlanCuenta(anio: number): Promise<IGastosRespuesta> {
    const URL_API = this.baseUrl + 'obtenerGastosPresupuestoPlanCuenta/' + anio;
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

  async obtenerGastoPresupuestoCuentaGrafico(anio: number, idCuentaPlan: number): Promise<IInformacionGastoPresupuestoGrafico> {
    const URL_API = `${this.baseUrl}obtenerGastoPresupuestoCuentaGrafico/${anio}/${idCuentaPlan}`;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IInformacionGastoPresupuestoGrafico;
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

  async obtenerGastoPresupuestoMesCuentaGrafico(anio: number, mes: number, idCuentaPlan: number): Promise<IInformacionGastoPresupuestoMesCuentaGrafico> {
    const URL_API = `${this.baseUrl}obtenerGastoPresupuestoMesCuentaGrafico/${anio}/${mes}/${idCuentaPlan}`;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IInformacionGastoPresupuestoMesCuentaGrafico;
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
        const serverMessage = error.response?.data?.mensaje || 'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
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
        const serverMessage = error.response?.data?.mensaje || 'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }

  async agregarGastoAnual(numeroMeses: number, presupuestoData: IPlanCuentasPresupuesto[]): Promise<string> {
    const URL_API = this.baseUrl + 'agregarGastoAnual/' + numeroMeses;
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, presupuestoData);
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

  async actualizarValorGastoPresupuesto(gastoPresupuesto: IGastoPresupuesto, tipo: number): Promise<string> {
    const URL_API = this.baseUrl + 'actualizarValorGastoPresupuesto/' + tipo;
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, gastoPresupuesto);
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

  async verificarExistePresupuestoCargado(anio: number): Promise<any> {
    const URL_API = this.baseUrl + 'verificarExistePresupuestoCargado/' + anio;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as any;
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

  async obtenerPresupuestoCuentaPlanAnual(anio: number): Promise<IPlanCuentasPresupuesto[]> {
    const URL_API = this.baseUrl + 'obtenerPresupuestoCuentaPlanAnual/' + anio;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IPlanCuentasPresupuesto[];
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

  async obtenerHistorialGastoPresupuesto(anio: number, esPresupuesto: number): Promise<IHistorialGastoPresupuesto[]> {
    const URL_API = this.baseUrl + 'obtenerPresupuestoGastoHistorial/' + anio + '/' + esPresupuesto;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IHistorialGastoPresupuesto[];
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
