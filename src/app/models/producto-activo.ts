import { ICecoActivo } from "./ceco-activo";
import { IModeloActivo } from "./modelo-activo";

export interface ProductoActivo {
    idProducto: number,
    codigoProducto: string,
    nombreProducto: string,
    fechaCompraProducto: Date,
    valorCompraProducto: number,
    esBienaControl: boolean,
    estaActivo: boolean,
    motivoBaja: string,
    idModelo: number,
    codigoCeco: string,
    codigoAuxiliar: number,
    modelo?: IModeloActivo,
    ceco?: ICecoActivo
}
