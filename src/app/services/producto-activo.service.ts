import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IProductoActivo, IProductoCustodioActivo, IRegistro } from '../models/producto-activo';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ProductoActivoService {

  constructor() { }

  baseUrl = environment.apiUrl + 'ProductoCustodio/';
  baseUrlProducto = environment.apiUrl + 'ProductoActivo/';

  async obtenerInformacionProductoCustodio(idProducto: string): Promise<IProductoCustodioActivo> {
    const URL_API = `${this.baseUrl}obtenerProductoCustodioPorIdProducto/${idProducto}`;
    try {
      const response = await axios.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IProductoCustodioActivo;
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

  async insertarCustodioProducto(custodioProductoData: IProductoCustodioActivo): Promise<string> {
    const URL_API = this.baseUrl + 'agregarProductoCustodio';
    try {
      const response = await axios.post<any>(URL_API, custodioProductoData);
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

  async darBajaProductoActivo(idProducto: number, productoActivoMotivo: IProductoActivo): Promise<string> {
    const URL_API = `${this.baseUrlProducto}actualizarProductoBajaActivo/${idProducto}`;
    try {
      const response = await axios.put<any>(URL_API, productoActivoMotivo);
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
