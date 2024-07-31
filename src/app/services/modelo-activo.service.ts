import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import { IModeloActivo } from '../models/modelo-activo';

@Injectable({
  providedIn: 'root'
})
export class ModeloActivoService {

  constructor() { }

  baseUrl = environment.apiUrl + 'ModeloActivo/';

  async obtenerModelos(): Promise<IModeloActivo[]> {
    const URL_API = this.baseUrl + 'obtenerModelos';
    try {
      const response = await axios.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IModeloActivo[];
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

  async insertarModelo(modeloData: IModeloActivo): Promise<string> {
    const URL_API = this.baseUrl + 'agregarModelo';
    try {
      const response = await axios.post<any>(URL_API, modeloData);
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

  async actualizarModelo(idModelo: number, modeloActualizado: IModeloActivo): Promise<string> {
    const URL_API = `${this.baseUrl}actualizarModelo/${idModelo}`;
    try {
      const response = await axios.put<any>(URL_API, modeloActualizado);
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

  async eliminarModelo(idModelo: number): Promise<string> {
    const URL_API = `${this.baseUrl}eliminarModelo/${idModelo}`;
    try {
      const response = await axios.delete<any>(URL_API);
      if (!response.data.esError) {
        return 'Modelo eliminado exitosamente';
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
