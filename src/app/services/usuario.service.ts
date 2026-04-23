import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { AuthService } from './auth-interceptor.service';
import axios from 'axios';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {

    baseUrl = environment.apiSegurosSuarez;

    constructor(private authService: AuthService) { }

    async obtenerInformacionPersona(cedula: string, origen: string): Promise<any> {
        const URL_API = `${this.baseUrl}consulta-ced2`;
        let formP = new FormData();
        formP.append('cedula', cedula);
        formP.append('actualizar', '0');
        formP.append('origen', origen);
        try {
            const response = await this.authService.apiClient.post<any>(URL_API, formP, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const serverMessage = error.response?.data?.mensaje || 'Ha ocurrido un error en el servidor.\nContactese con TI.';
                throw new Error(`${serverMessage}`);
            } else {
                throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
            }
        }
    }

    async obtenerApellidosNombresSeparados(apellidosNombres: string): Promise<any> {
        const URL_API = `${this.baseUrl}postSepararNombresRH`;
        let formData = new FormData();
        formData.append('cliente', apellidosNombres);
        try {
            const response = await this.authService.apiClient.post<any>(URL_API, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const serverMessage = error.response?.data?.mensaje || 'Ha ocurrido un error en el servidor.\nContactese con TI.';
                throw new Error(`${serverMessage}`);
            } else {
                throw new Error(`${error ?? 'Error desconocido.\nContactese con TI.'}`);
            }
        }
    }

}