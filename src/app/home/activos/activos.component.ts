import { Component, ElementRef, ViewChild } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';
import { HomeComponent } from '../home.component';
import { IProductoCustodioActivo } from 'src/app/models/producto-activo';
import { ProductoActivoService } from 'src/app/services/producto-activo.service';
import { ToastrService } from 'src/app/services/toastr.service';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import { AppComponent } from 'src/app/app.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $: any;
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-activos',
  templateUrl: './activos.component.html',
  styleUrls: ['./activos.component.css']
})
export class ActivosComponent {

  @ViewChild('dataTableBienes', { static: false }) tableBienes!: ElementRef;

  isEditing: boolean = false;
  lstProductosCustodioActivo: IProductoCustodioActivo[] = [];
  dtOptions: any;
  dataTable: any;
  productoForm!: FormGroup;
  custodioForm!: FormGroup;
  lstProductosInventarioExportar: any = [];

  constructor(private loadingService: LoadingService,
    private homeComponent: HomeComponent,
    private productosService: ProductoActivoService,
    private fb: FormBuilder,
    public appComponent: AppComponent,
    private toastrService: ToastrService) { }

  ngOnInit() {
    this.InicializarTablaProductosCustodio();
    this.InicializarInformacionForm();
  }

  InicializarInformacionForm() {
    this.custodioForm = this.fb.group({
      idCustodio: [0, [Validators.required]],
      nombreApellidoCustodio: ['', [Validators.required, Validators.maxLength(300)]],
      estaActivo: [true, [Validators.required]]
    });
    this.productoForm = this.fb.group({

    });
  }

  async InicializarTablaProductosCustodio() {
    try {
      this.loadingService.showLoading();
      this.lstProductosCustodioActivo = await this.productosService.obtenerListaProductoCustodio();
      this.dtOptions = {
        data: this.lstProductosCustodioActivo,
        info: false,
        language: {
          ...this.GetSpanishLanguage()
        },
        columns: [
          {
            title: 'Tipo',
            data: 'producto.esBienaControl',
            render: (data: boolean) => data ? 'Bien de control' : 'Activo'
          },
          { title: 'Plan de Cuentas', data: 'producto.ceco.descripcionCeco' },
          { title: 'Marca', data: 'producto.modelo.marca.nombreMarca' },
          { title: 'Modelo', data: 'producto.modelo.nombreModelo' },
          { title: 'Descripción', data: 'producto.nombreProducto' },
          {
            title: 'Fecha Adquisición',
            data: 'producto.fechaCompraProducto',
            render: (data: string) => this.formatDate(data),
            className: 'text-right'
          },
          {
            title: 'Valor compra',
            data: 'producto.valorCompraProducto',
            render: (data: any, type: any, full: any, meta: any) => {
              return this.appComponent.formatoDinero(full.producto.valorCompraProducto, true);
            },
            className: 'text-right'
          },
          {
            title: 'Custodio',
            data: 'custodio',
            render: (data: any) => data === null ? 'Sin asignar' : data.nombreApellidoCustodio
          },
          // {
          //   targets: -2,
          //   searchable: false,
          //   render: function (data: any, type: any, full: any, meta: any) {
          //     return `<button type="button" class="btn btn-primary btn-sm" onclick="EditarMarca(${full.idMarca})"><i class="fas fa-edit"></i></button>`;
          //   },
          //   className: 'text-center btn-acciones-column'
          // },
          // {
          //   targets: -1,
          //   orderable: false,
          //   searchable: false,
          //   render: function (data: any, type: any, full: any, meta: any) {
          //     return `<button type="button" class="btn btn-danger btn-sm" onclick="EliminarMarca(${full.idMarca})"><i class="fas fa-trash-alt"></i></button>`;
          //   },
          //   className: 'text-center btn-acciones-column'
          // }
        ],
        // columnDefs: [
        //   {
        //     targets: [8, 9],
        //     orderable: false,
        //     searchable: false,
        //     width: '50px'
        //   }
        // ],
        responsive: false,
        autoWidth: false,
        scrollX: true,
      };
      this.dataTable = $(this.tableBienes.nativeElement);
      this.dataTable.DataTable(this.dtOptions);
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

  AbrirModal(esEdicion: boolean) {
    this.isEditing = esEdicion;
    if (!esEdicion) {
      // this.CrearMarcaForm();
    }
    $('#productoModal').modal('show');
  }

  descargarExcel(): void {
    this.generarListaExcel();
  }

  generarListaExcel(): void {
    if (this.lstProductosCustodioActivo.length > 0) {
      this.lstProductosInventarioExportar = [];
      this.lstProductosCustodioActivo.forEach(productoCustodio => {
        let productoInventarioExportar = {
          'Tipo': productoCustodio.producto?.esBienaControl ? 'Bien de Control' : 'Activo',
          'Plan de cuentas': `${productoCustodio.producto?.ceco?.codigoCeco}-${productoCustodio.producto?.ceco?.descripcionCeco}`,
          'Código': productoCustodio.producto?.codigoProducto,
          'Marca': productoCustodio.producto?.modelo?.marca?.nombreMarca,
          'Modelo': productoCustodio.producto?.modelo?.nombreModelo,
          'Descripción': productoCustodio.producto?.nombreProducto,
          'Fc. de Adquisición': productoCustodio.producto?.fechaCompraProducto == null ? '' : this.formatearFecha(productoCustodio.producto?.fechaCompraProducto),
          'Valor de Compra': productoCustodio.producto?.valorCompraProducto,
          'Custodio': productoCustodio.custodio == null ? 'Sin asignar' : productoCustodio.custodio.nombreApellidoCustodio
        }
        this.lstProductosInventarioExportar.push(productoInventarioExportar);
      });
      this.exportarInformacionAExcel(this.lstProductosInventarioExportar, "Listado_bienes", true);
    }
  }

  formatearFecha(fecha: Date | string): string {
    const date = new Date(fecha);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  exportarInformacionAExcel(resumen: any[], excelFileName: string, descargar: boolean): void {
    try {
      // Crear la hoja de trabajo desde el resumen
      const wresumen: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

      // Especificar valores en celdas
      wresumen['A1'] = { t: 's', v: 'Listado de bienes' };
      wresumen['A2'] = { t: 's', v: 'Fecha generación' };
      wresumen['B2'] = { t: 's', v: new Date().toISOString() }; // Llamar a toISOString()

      // Crear un nuevo objeto resumen ajustado para empezar desde la fila 5
      const resumenAjustado = resumen.map((item) => {
        // Define newItem con una firma de índice
        const newItem: { [key: string]: any } = {};
        Object.keys(item).forEach(key => {
          newItem[key] = item[key];
        });
        return newItem;
      });

      // Insertar los datos ajustados en la hoja de trabajo empezando desde A5
      XLSX.utils.sheet_add_json(wresumen, resumenAjustado, { origin: 'A5', skipHeader: false });

      // Crear el libro de trabajo con solo una hoja
      const workbook: XLSX.WorkBook = {
        Sheets: {
          'Resumen': wresumen
        },
        SheetNames: ['Resumen']
      };

      // Escribir el libro de trabajo a un buffer
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Guardar el archivo usando file-saver
      if (descargar) {
        this.saveAsExcelFile(excelBuffer, excelFileName, true);
      }

    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ha ocurrido un error al descargar el listado de emisiones!',
        footer: 'Contactese con el Administrador.'
      });
    }
  }

  private saveAsExcelFile(buffer: any, fileName: string, descargar: boolean): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    const now = new Date();
    const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const file = descargar ? `${fileName}_${formattedDate}.xlsx` : `${fileName}.xlsx`;

    FileSaver.saveAs(data, file);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  SetInactive() {
    this.homeComponent.SetInactive();
  }

  GetSpanishLanguage() {
    return SpanishLanguage;
  }

}
