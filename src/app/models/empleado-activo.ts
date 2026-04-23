
export interface IEmpleadoActivo {
    cedulaEmpleado: string;
    nombreEmpleado: string;
    apellidoEmpleado: string;
    telefonoEmpleado: string;
    emailEmpleado: string;
    fotoEmpleado: string;
    nombreCargo: string;
    nombreDepartamento: string;
    descripcionSucursal: string;
    estaActivo: boolean;
    idCargo: number;
    idDepartamento: number;
    idSucursal: number;
    fechaRegistro: string;
    fechaNacimiento: string;
    fechaIngreso: string;
    numeroCuenta: string;
    sueldoEmpleado: number;
    numeroCorporativo: string;
    emailCorporativo: string;
    direccionEmpleado: string;
    fotoUrl: string
}

export interface IInformacionEmpleado {
    identificacionEmpleado: string;
    sueldo: number;
    numeroCuenta: string;
}

export interface IDocumentoEmpleado {
    nombre: string;
    size_kb: number;
    url: string;
}

export interface IListarDocumentosResponse {
    ok: boolean;
    documentos: IDocumentoEmpleado[];
    zip?: {
        nombre: string;
        url: string | null;
    };
}
