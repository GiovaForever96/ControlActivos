import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ICustodioActivo } from '../models/custodio-activo';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class CustodioActivoService {

  constructor() { }

  baseUrl = environment.apiUrl + 'CustodioActivo/';
  baseUrlProductoCustodio = environment.apiUrl + 'ProductoCustodioActivo/';

  async obtenerInformacionProductoCustodio(): Promise<ICustodioActivo[]> {
    const URL_API = `${this.baseUrl}obtenerCustodios`;
    try {
      const response = await axios.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as ICustodioActivo[];
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

  async obtenerCustodios(): Promise<ICustodioActivo[]> {
    const URL_API = this.baseUrl + 'obtenerCustodios';
    try {
      const response = await axios.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as ICustodioActivo[];
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

  async insertarCustodio(custodioData: ICustodioActivo): Promise<string> {
    const URL_API = this.baseUrl + 'agregarCustodio';
    try {
      const response = await axios.post<any>(URL_API, custodioData);
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

  async actualizarCustodio(idCustodio: number, custodioActualizado: ICustodioActivo): Promise<string> {
    const URL_API = `${this.baseUrl}actualizarCustodio/${idCustodio}`;
    try {
      const response = await axios.put<any>(URL_API, custodioActualizado);
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

  async eliminarCustodio(idCustodio: number): Promise<string> {
    const URL_API = `${this.baseUrl}eliminarCustodio/${idCustodio}`;
    try {
      const response = await axios.delete<any>(URL_API);
      if (!response.data.esError) {
        return 'Custodio eliminado exitosamente';
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