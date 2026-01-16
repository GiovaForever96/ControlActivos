import { ICecoActivo } from "./ceco-activo";
import { ICustodioActivo } from "./custodio-activo";
import { IEmpleadoActivo } from "./empleado-activo";
import { IModeloActivo } from "./modelo-activo";
import { ITipoActaActivo } from "./tipo-acta-activo";

export interface IProductoActivo {
    idProducto: number,
    codigoProducto: string,
    nombreProducto: string,
    fechaCompraProducto: Date,
    valorCompraProducto: number,
    esBienaControl: boolean,
    estaActivo: boolean,
    motivoBaja: string,
    idMarca: number,
    idModelo: number,
    codigoCeco: string,
    codigoAuxiliar: number,
    modelo?: IModeloActivo,
    ceco?: ICecoActivo
    rucProveedor?: string,
    fotoProducto: string,
    fotoUrl: string,
    nombreModelo?: string
    nombreMarca?: string
}

export interface IProductoCustodioActivo {
    idProductoCustodio: number,
    idCustodio: number,
    idProducto: number,
    estaActivo: boolean,
    custodio?: ICustodioActivo,
    producto?: IProductoActivo,
    seleccionado: boolean
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

export interface IInformacionQR {
    urlInformacion: string,
    codigoProducto: string
}

export interface IProductoEmpleadoActivo {
    idProductoEmpleado: number,
    fechaGeneracion: Date,
    cedulaEmpleado: string
    idProducto: number,
    idTipoActa: number,
    idEmpleadoEntrega: string,
    idEmpleadoRecibe: string,
    observacion: string,
    estaActivo: boolean,
    empleado?: IEmpleadoActivo,
    producto?: IProductoActivo,
}

export interface IMaestroActa {
    idMaestroActa: number,
    fechaGeneracion: Date,
    idTipoActa: number,
    empleadoEntrega: string,
    empleadoRecibe: string,
    estaActivo: boolean,
    observacion: string,
    tipoActa?: ITipoActaActivo,
    empleado?: IEmpleadoActivo,
}

export interface IDetalleActa {
    idDetalleActa: number,
    idMaestroActa: number,
    idProducto: number,
    estaActivo: boolean,
    producto?: IProductoActivo,
    maestroActa?: IMaestroActa
}

export interface IProductoEmpleadoResponse {
    idProductoEmpleado: number,
    cedulaEmpleado: string
    idProducto: number,
    codigoProducto: string,
    nombreProducto: string,
    nombreModelo?: string
    nombreMarca?: string
    estaActivo: boolean,
}
