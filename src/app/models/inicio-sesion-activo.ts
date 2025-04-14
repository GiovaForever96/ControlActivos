export interface IInicioSesionActivo {
    username: string;
    password: string;
    platformId: number;
}

export interface IActualizacionContrasenia {
    userId: string;
    platformId: number;
    password: string;
}