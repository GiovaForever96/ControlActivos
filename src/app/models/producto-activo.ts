import { ICecoActivo } from "./ceco-activo";
import { ICustodioActivo } from "./custodio-activo";
import { IModeloActivo } from "./modelo-activo";

export interface IProductoActivo {
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

export interface IProductoCustodioActivo {
    idProductoCustodio: number,
    idCustodio: number,
    idProducto: number,
    estaActivo: boolean,
    custodio?: ICustodioActivo,
    producto?: IProductoActivo
}

export interface IRegistro {
    id: number,
    tipo_documento: string,
    numero_documento: string,
    nombre_completo: string,
    nombre1: string,
    nombre2: string,
    apellido1: string,
    apellido2: string,
    fecha_apertura: Date,
    fecha_nacimiento: Date,
    sexo: string,
    edad: string,
    observacion: string,
    actualizado: number,
    fecha_registro: Date,
    fecha_actualizacion: Date
}