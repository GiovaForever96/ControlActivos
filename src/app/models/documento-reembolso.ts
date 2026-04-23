export interface IDocumentoReembolsoResponse {
    idDocumento: number;
    nombreArchivo: string;
    rutaArchivo: string;
    tipoMime: string;
    estado: string;
}

export interface IDocumentoProcesadoResponse {
    idDocumento: number;
    estado: string;
    documento: IDocumentoGastoExtraidoDTO;
}

export interface IDocumentoGastoExtraidoDTO {
    tipoDocumento: string;
    numeroDocumento?: string | null;
    fechaEmision?: string | null;
    proveedor?: string | null;
    rucProveedor?: string | null;
    moneda?: string | null;

    subtotalSinImpuestos?: number | null;
    importeTotal?: number | null;
    baseCero?: number | null;

    resumenImpuestos: IResumenImpuestoDto[];
    items: IItemDocumentoDto[];

    descripcionResumen?: string | null;
    esLegible: boolean;
    requiereRevisionManual: boolean;

    alertasValidacion: string[];
}

export interface IResumenImpuestoDto {
    porcentaje?: number | null;
    baseImponible?: number | null;
    valorImpuesto?: number | null;
    etiquetaOriginal?: string | null;
}

export interface IItemDocumentoDto {
    descripcion: string;
    cantidad?: number | null;
    precioUnitario?: number | null;
    descuento?: number | null;
    totalSinImpuesto?: number | null;
    impuestoPorcentaje?: number | null;
}

export interface IFilaFacturaTabla {
    numero: number;
    fecha: string;
    ruc: string;
    proveedor: string;
    comprobanteNumero: string;
    detalleGasto: string;
    base15: number;
    base0: number;
    iva15: number;
    valor: number;
    idDocumento: number;
    estado: string;
    requiereRevisionManual: boolean;
    alertasValidacion: string[];
    nombreArchivo: string;
    tipoDocumento: string;
    esLegible: boolean;
}