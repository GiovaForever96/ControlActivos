import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IInformacionQR, IProductoActivo, IProductoCustodioActivo } from '../models/producto-activo';
import { ICecoActivo } from '../models/ceco-activo';
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
  baseUrlCeco = environment.apiUrl + 'CecoActivo/';

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
        const serverMessage = error.response?.data?.mensaje || 'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
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
        const serverMessage = error.response?.data?.mensaje || 'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
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
        const serverMessage = error.response?.data?.mensaje || 'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
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
        return `Error: ${response.data.mensaje}`;
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
        const serverMessage = error.response?.data?.mensaje || 'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
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
        const serverMessage = error.response?.data?.mensaje || 'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }

  // SERVICIOS ÚNICAMENTE PARA EL CRUD DEL PRODUCTO (BIEN)
  async obtenerProductos(): Promise<IProductoActivo[]> {
    const URL_API = this.baseUrlProducto + 'obtenerProductos';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IProductoActivo[];
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage =
          error.response?.data?.mensaje ||
          'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }

  async insertarProducto(productoData: IProductoActivo): Promise<string> {
    const URL_API = this.baseUrlProducto + 'agregarProducto';
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, productoData);
      if (!response.data.esError) {
        return response.data.mensaje;
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage =
          error.response?.data?.mensaje ||
          'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }

  async actualizarProducto(idProducto: number, productoActualizado: IProductoActivo): Promise<string> {
    const URL_API = this.baseUrlProducto + 'actualizarProducto/' + idProducto;
    try {
      const response = await this.authService.apiClient.put<any>(
        URL_API,
        productoActualizado
      );
      if (!response.data.esError) {
        return response.data.mensaje;
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage =
          error.response?.data?.mensaje ||
          'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }

  async obtenerCecos(): Promise<ICecoActivo[]> {
    const URL_API = this.baseUrlCeco + 'obtenerCecos';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as ICecoActivo[];
      } else {
        throw new Error(response.data.mensaje);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage =
          error.response?.data?.mensaje ||
          'Ha ocurrido un error en el servidor.\nContactese con TI.';
        throw new Error(`${serverMessage}`);
      } else {
        throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
      }
    }
  }
}

