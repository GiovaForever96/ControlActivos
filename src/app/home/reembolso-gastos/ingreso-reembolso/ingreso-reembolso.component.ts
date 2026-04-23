import { Component } from '@angular/core';
import { IDocumentoProcesadoResponse, IDocumentoReembolsoResponse, IFilaFacturaTabla, IResumenImpuestoDto } from 'src/app/models/documento-reembolso';
import { DocumentoReembolsoService } from 'src/app/services/documento-reembolso.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastrService } from 'src/app/services/toastr.service';

@Component({
  selector: 'app-ingreso-reembolso',
  templateUrl: './ingreso-reembolso.component.html',
  styleUrls: ['./ingreso-reembolso.component.css']
})
export class IngresoReembolsoComponent {

  archivoSeleccionado: File | null = null;
  nombreArchivo = '';
  documentoSubido: IDocumentoReembolsoResponse | null = null;

  subiendo = false;
  procesando = false;

  filas: IFilaFacturaTabla[] = [];

  mensaje = '';
  esError = false;

  constructor(private reembolsoDocumentoService: DocumentoReembolsoService,
    private toastrService: ToastrService,
    private loadingService: LoadingService) { }

  onSeleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files && input.files.length > 0 ? input.files[0] : null;

    if (!archivo) return;

    this.archivoSeleccionado = archivo;
    this.nombreArchivo = archivo.name;
    this.documentoSubido = null;
    this.mostrarMensaje('', false);
  }

  async subirDocumento() {
    this.loadingService.showLoading();
    try {
      if (!this.archivoSeleccionado) {
        this.mostrarMensaje('Seleccione un archivo para continuar.', true);
        return;
      }
      this.subiendo = true;
      let responseSubirDocumento = await this.reembolsoDocumentoService.subirDocumento(this.archivoSeleccionado);
      console.log(responseSubirDocumento);
      this.subiendo = false;
      this.documentoSubido = responseSubirDocumento;
      this.mostrarMensaje('Documento subido correctamente.', false);
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener los productos', error.message);
      } else {
        this.toastrService.error('Error al obtener los productos', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async procesarDocumento() {
    this.loadingService.showLoading();
    try {
      if (!this.documentoSubido?.idDocumento) {
        this.mostrarMensaje('Primero debe subir el documento.', true);
        return;
      }
      this.procesando = true;
      let responseProcesamientoDatos = await this.reembolsoDocumentoService.procesarDocumento(this.documentoSubido.idDocumento);
      console.log(responseProcesamientoDatos);
      const fila = this.mapearFila(responseProcesamientoDatos);
      this.filas = [...this.filas, fila];
      this.renumerarFilas();
      this.limpiarCargaActual();
      this.procesando = false;
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener los productos', error.message);
      } else {
        this.toastrService.error('Error al obtener los productos', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  mapearFila(procesado: IDocumentoProcesadoResponse): IFilaFacturaTabla {
    const doc = procesado.documento;
    const impuesto15 = this.obtenerImpuestoPorPorcentaje(doc.resumenImpuestos, 15);

    const base15 = this.toNumber(impuesto15?.baseImponible);
    const iva15 = this.toNumber(impuesto15?.valorImpuesto);
    const base0 = this.toNumber(doc.baseCero);
    const valor = this.toNumber(doc.importeTotal);

    const detalleGasto =
      (doc.descripcionResumen || '').trim() ||
      (doc.items?.find(x => (x.descripcion || '').trim())?.descripcion ?? '');

    return {
      numero: 0,
      fecha: this.formatearFecha(doc.fechaEmision),
      ruc: doc.rucProveedor || '',
      proveedor: doc.proveedor || '',
      comprobanteNumero: doc.numeroDocumento || '',
      detalleGasto: detalleGasto,
      base15: this.redondear(base15),
      base0: this.redondear(base0),
      iva15: this.redondear(iva15),
      valor: this.redondear(valor),

      idDocumento: procesado.idDocumento,
      estado: procesado.estado || '',
      requiereRevisionManual: doc.requiereRevisionManual,
      alertasValidacion: doc.alertasValidacion || [],
      nombreArchivo: this.documentoSubido?.nombreArchivo || this.nombreArchivo || '',
      tipoDocumento: doc.tipoDocumento || '',
      esLegible: doc.esLegible
    };
  }

  obtenerImpuestoPorPorcentaje(resumen: IResumenImpuestoDto[] | null | undefined, porcentajeBuscado: number): IResumenImpuestoDto | undefined {
    if (!resumen?.length) return undefined;
    return resumen.find(x => this.toNumber(x.porcentaje) === porcentajeBuscado);
  }

  renumerarFilas(): void {
    this.filas = this.filas.map((fila, index) => ({
      ...fila,
      numero: index + 1
    }));
  }

  eliminarFila(index: number): void {
    this.filas.splice(index, 1);
    this.renumerarFilas();
    this.filas = [...this.filas];
  }

  limpiarTabla(): void {
    this.filas = [];
  }

  limpiarCargaActual(): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.documentoSubido = null;

    const input = document.getElementById('inputArchivoFactura') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  get totalBase15(): number {
    return this.redondear(this.filas.reduce((acc, x) => acc + this.toNumber(x.base15), 0));
  }

  get totalBase0(): number {
    return this.redondear(this.filas.reduce((acc, x) => acc + this.toNumber(x.base0), 0));
  }

  get totalIva15(): number {
    return this.redondear(this.filas.reduce((acc, x) => acc + this.toNumber(x.iva15), 0));
  }

  get totalValor(): number {
    return this.redondear(this.filas.reduce((acc, x) => acc + this.toNumber(x.valor), 0));
  }

  get totalRegistros(): number {
    return this.filas.length;
  }

  mostrarMensaje(texto: string, error: boolean): void {
    this.mensaje = texto;
    this.esError = error;
  }

  toNumber(valor: any): number {
    return Number(valor || 0);
  }

  redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  formatearFecha(fecha?: string | Date | null): string {
    if (!fecha) return '';

    const dt = new Date(fecha);
    if (isNaN(dt.getTime())) return '';

    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
  }

  getClaseRevision(fila: IFilaFacturaTabla): string {
    return fila.requiereRevisionManual ? 'bg-warning text-dark' : 'bg-success';
  }

  getTextoRevision(fila: IFilaFacturaTabla): string {
    return fila.requiereRevisionManual ? 'Manual' : 'OK';
  }

  getClaseLegible(fila: IFilaFacturaTabla): string {
    return fila.esLegible ? 'bg-success' : 'bg-danger';
  }

  getTextoLegible(fila: IFilaFacturaTabla): string {
    return fila.esLegible ? 'Legible' : 'No legible';
  }

  get filasVacias(): any[] {
    const cantidad = Math.max(0, 8 - this.filas.length);
    return Array(cantidad);
  }
}
