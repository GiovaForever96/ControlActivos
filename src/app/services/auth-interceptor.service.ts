// src/services/auth.service.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { environment } from 'src/environments/environment';

// Servicio de autenticación
export class AuthService {
  private static instance: AxiosInstance;
  private subscribers: Array<(token: string) => void> = [];

  constructor() {
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
          if (error.response?.status === 401) { // No autorizado

            return new Promise((resolve, reject) => {
              this.subscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers['Authorization'] = `Bearer ${token}`;
                } else {
                  originalRequest.headers = { 'Authorization': `Bearer ${token}` };
                }
                resolve(AuthService.instance(originalRequest));
              });
            });
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
}
