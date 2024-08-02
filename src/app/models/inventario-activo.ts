import { IProductoActivo } from "./producto-activo";

export interface IInventarioActivo {
    idInventario: number,
    fechaCreacionInventario: Date,
    descripcionInventario: string,
    estaActivo: boolean
}

export interface IProductoInventarioActivo {
    idProductoInventario: number,
    idProducto: number,
    idInventario: number,
    estaActivo: boolean,
    fechaRegistro: Date,
    producto: IProductoActivo,
    inventario: IInventarioActivo,
}