import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { environment } from 'src/environments/environment';

// Servicio de autenticación
@Injectable({
  providedIn: 'root', // Esto asegura que el servicio esté disponible en toda la aplicación
})
export class AuthService {
  private static instance: AxiosInstance;

  constructor(private router: Router) {
    if (!AuthService.instance) {
      AuthService.instance = axios.create({
        baseURL: environment.apiUrl, // Cambia esto a la URL de tu API
      });

      // Interceptor de solicitud para añadir el token
      AuthService.instance.interceptors.request.use(
        (config: any) => {
          const token = this.getToken();
          if (token) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${token}`
            };
          }
          return config;
        },
        (error: AxiosError) => Promise.reject(error)
      );

      // Interceptor de respuesta para manejar errores de autenticación
      AuthService.instance.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error: AxiosError) => {
          const originalRequest = error.config as AxiosRequestConfig;
          if (error.response?.status === 401) {
            console.log('No autorizado');
          }
          return Promise.reject(error);
        }
      );
    }
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  public get apiClient(): AxiosInstance {
    return AuthService.instance;
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('lastLogin');
    localStorage.removeItem('roles');
    localStorage.removeItem('userName');
    this.router.navigate(['/']);
  }

}
