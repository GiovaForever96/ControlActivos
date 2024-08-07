import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IInformacionQR, IProductoActivo, IProductoCustodioActivo, IRegistro } from '../models/producto-activo';
import axios from 'axios';
import { AuthService } from './auth-interceptor.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoActivoService {

  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'ProductoCustodio/';
  baseUrlProducto = environment.apiUrl + 'ProductoActivo/';
  baseUrlProductoInventario = environment.apiUrl + 'ProductoInventarioActivo/';
  baseUrlImpresionQR = environment.apiUrl + 'ImpresionQRActivo/';

  async obtenerInformacionProductoCustodioPorIdProducto(idProducto: string): Promise<IProductoCustodioActivo> {
    const URL_API = `${this.baseUrl}obtenerProductoCustodioPorIdProducto/${idProducto}`;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
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

  async obtenerListaProductoCustodio(): Promise<IProductoCustodioActivo[]> {
    const URL_API = `${this.baseUrl}obtenerProductosCustodio`;
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IProductoCustodioActivo[];
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
      const response = await this.authService.apiClient.post<any>(URL_API, custodioProductoData);
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
      const response = await this.authService.apiClient.put<any>(URL_API, productoActivoMotivo);
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

  async registrarProductoInventario(idInventario: number, idProducto: number): Promise<string> {
    const URL_API = `${this.baseUrlProductoInventario}registrarProductoInventario/${idInventario}/${idProducto}`;
    try {
      const response = await this.authService.apiClient.put<any>(URL_API, null);
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

  async imprimirEtiquetasQR(informacionQR: IInformacionQR[]): Promise<string> {
    const URL_API = this.baseUrlImpresionQR + 'imprimirQR';
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, informacionQR);
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
