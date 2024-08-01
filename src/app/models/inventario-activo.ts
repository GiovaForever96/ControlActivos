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
    producto: IProductoInventarioActivo,
    inventario: IInventarioActivo,
}