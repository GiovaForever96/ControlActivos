import axios from 'axios';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {

  constructor() { }

  async getImage(url: string): Promise<string> {
    try {
      // Realizar la solicitud con axios
      const response = await axios.get(url, {
        responseType: 'blob', // Obtener la respuesta como Blob
      });

      // Convertir el blob a Base64
      return this.blobToBase64(response.data);
    } catch (error) {
      console.error('Error al obtener la imagen:', error);
      throw error;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
