export interface ICustodioActivo {
    idCustodio: number,
    nombreApellidoCustodio: string,
    estaActivo: boolean,
    identificacion: string,
    idSucursal: number,
    sucursal: ISucursalActivo
}

export interface ISucursalActivo {
    idSucursal: number,
    descripcionSucursal: string,
    estaActivo: boolean
}