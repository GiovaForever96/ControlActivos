import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ICustodioActivo } from '../models/custodio-activo';
import axios from 'axios';
import { IProductoCustodioActivo } from '../models/producto-activo';

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

}
