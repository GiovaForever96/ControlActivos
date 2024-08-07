// src/services/auth.service.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { environment } from 'src/environments/environment';

// Servicio de autenticación
export class AuthService {
  private static instance: AxiosInstance;
  private refreshTokenInProgress = false;
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
            if (!this.refreshTokenInProgress) {
              this.refreshTokenInProgress = true;
              try {
                await this.refreshToken();
                this.refreshTokenInProgress = false;
                this.subscribers.forEach(callback => callback(this.getToken()!));
                this.subscribers = [];
                if (originalRequest.headers) {
                  originalRequest.headers['Authorization'] = `Bearer ${this.getToken()!}`;
                } else {
                  originalRequest.headers = { 'Authorization': `Bearer ${this.getToken()!}` };
                }
                return AuthService.instance(originalRequest);
              } catch (refreshError) {
                this.logout();
                return Promise.reject(refreshError);
              }
            } else {
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
          }
          return Promise.reject(error);
        }
      );
    }
  }

  private async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await AuthService.instance.post('/AuthActivo/refresh-token', { refreshToken });
    const { Token, RefreshToken } = response.data;
    this.saveToken(Token);
    this.saveRefreshToken(RefreshToken);
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private saveRefreshToken(refreshToken: string) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  private logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  public get apiClient(): AxiosInstance {
    return AuthService.instance;
  }
}
