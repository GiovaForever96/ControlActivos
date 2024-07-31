import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IMarcaActivo } from '../models/marca-activo';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class MarcaActivoService {

  constructor() { }

  baseUrl = environment.apiUrl + 'MarcaActivo/';

  async obtenerMarcas(): Promise<IMarcaActivo[]> {
    const URL_API = this.baseUrl + 'obtenerMarcas';
    try {
      const response = await axios.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as IMarcaActivo[];
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

  async insertarMarca(marcaData: IMarcaActivo): Promise<string> {
    const URL_API = this.baseUrl + 'agregarMarca';
    try {
      const response = await axios.post<any>(URL_API, marcaData);
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

  async actualizarMarca(idMarca: number, marcaActualizado: IMarcaActivo): Promise<string> {
    const URL_API = `${this.baseUrl}actualizarMarca/${idMarca}`;
    try {
      const response = await axios.put<any>(URL_API, marcaActualizado);
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

  async eliminarMarca(idMarca: number): Promise<string> {
    const URL_API = `${this.baseUrl}eliminarMarca/${idMarca}`;
    try {
      const response = await axios.delete<any>(URL_API);
      if (!response.data.esError) {
        return 'Marca eliminada exitosamente';
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
