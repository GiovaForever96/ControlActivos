import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IInventarioActivo, IProductoInventarioActivo } from '../models/inventario-activo';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class InventarioActivoService {

  constructor() { }

  baseUrl = environment.apiUrl + 'InventarioActivo/';
  baseUrlProductoInventario = environment.apiUrl + 'ProductoInventarioActivo/';
  private apiUrl = 'https://api.ipify.org/?format=json';

  async obtenerIpPermitida(): Promise<string[]> {
    const URL_API = this.baseUrl + 'obtenerIpsPermitidas';
    try {
      const response = await axios.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data as string[];
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

  async obtenerIpPublicaCliente(): Promise<string> {
    try {
      const response = await axios.get(this.apiUrl);
      return response.data.ip;
    } catch (error) {
      console.error('Error fetching IP:', error);
      throw error;
    }
  }

  async obtenerInventarios(): Promise<IInventarioActivo[]> {
    const URL_API = this.baseUrl + 'obtenerInventarios';
    try {
      const response = await axios.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IInventarioActivo[];
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

  async obtenerProductosInventarios(idInventario: number): Promise<IProductoInventarioActivo[]> {
    const URL_API = `${this.baseUrlProductoInventario}obtenerProductosInventarioPorIdInventario/${idInventario}`;
    try {
      const response = await axios.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IProductoInventarioActivo[];
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

  async crearNuevoInventario(inventarioData: IInventarioActivo): Promise<string> {
    const URL_API = this.baseUrl + 'agregarInventario';
    try {
      const response = await axios.post<any>(URL_API, inventarioData);
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
