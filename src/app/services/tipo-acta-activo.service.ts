import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ITipoActaActivo } from '../models/tipo-acta-activo';
import axios from 'axios';
import { AuthService } from './auth-interceptor.service';

@Injectable({
  providedIn: 'root'
})
export class TipoActaActivoService {

  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'TipoActaActivo/';

  async obtenerTipoActas(): Promise<ITipoActaActivo[]> {
    const URL_API = this.baseUrl + 'obtenerTipoActas';
    try {
      const response = await this.authService.apiClient.get<any>(URL_API);
      if (!response.data.esError) {
        return response.data.resultado as ITipoActaActivo[];
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
