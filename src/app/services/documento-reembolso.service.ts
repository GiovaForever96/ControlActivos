import { Injectable } from '@angular/core';
import { AuthService } from './auth-interceptor.service';
import { environment } from 'src/environments/environment';
import axios from 'axios';
import { IDocumentoProcesadoResponse, IDocumentoReembolsoResponse } from '../models/documento-reembolso';

@Injectable({
  providedIn: 'root'
})
export class DocumentoReembolsoService {

  constructor(private authService: AuthService) { }

  baseUrl = environment.apiUrl + 'ReembolsoGastos/';

  async subirDocumento(archivo: File): Promise<IDocumentoReembolsoResponse> {
    const URL_API = this.baseUrl + 'subir-documento';

    const formData = new FormData();
    formData.append('Archivo', archivo);

    try {
      const response = await this.authService.apiClient.post<any>(URL_API, formData);
      if (!response.data.esError) {
        return response.data.resultado as IDocumentoReembolsoResponse;
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

  async procesarDocumento(idDocumento: number): Promise<IDocumentoProcesadoResponse> {
    const URL_API = this.baseUrl + 'procesar-documento/' + idDocumento;
    try {
      const response = await this.authService.apiClient.post<any>(URL_API, null);
      if (!response.data.esError) {
        return response.data.resultado as IDocumentoProcesadoResponse;
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
