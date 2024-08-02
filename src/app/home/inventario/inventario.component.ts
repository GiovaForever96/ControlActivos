import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { LoadingService } from 'src/app/services/loading.service';
import { HomeComponent } from '../home.component';
import { ToastrService } from 'src/app/services/toastr.service';
import { InventarioActivoService } from 'src/app/services/inventario-activo.service';
import { IInventarioActivo, IProductoInventarioActivo } from 'src/app/models/inventario-activo';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import Swal from 'sweetalert2';
declare var $: any;
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent {

  @ViewChild('dataTableBienesInventario', { static: false }) tableBienesInventario!: ElementRef;

  lstInventarios: IInventarioActivo[] = [];
  lstInventariosFiltrados: IInventarioActivo[] = [];
  lstProductosInventario: IProductoInventarioActivo[] = [];
  visualizarOpciones = false;
  inventarioControl = new FormControl('', Validators.required);
  idInventarioConsultar: number = 0;
  dtOptions: any;
  dataTable: any;
  inventarioForm!: FormGroup;
  lstProductosInventarioExportar: any = [];

  constructor(private loadingService: LoadingService,
    private appComponent: AppComponent,
    private homeComponent: HomeComponent,
    private fb: FormBuilder,
    private inventariosService: InventarioActivoService,
    private changeDetector: ChangeDetectorRef,
    private toastrService: ToastrService) { }

  ngOnInit() {
    this.CargarListadoInventarios();
    this.CrearInventarioForm();
  }

  CrearInventarioForm() {
    this.inventarioForm = this.fb.group({
      idInventario: [0, [Validators.required]],
      fechaCreacionInventario: [new Date, [Validators.required, Validators.maxLength(1000)]],
      descripcionInventario: ['', [Validators.required]],
      estaActivo: [true, [Validators.required]]
    });
  }

  async CargarListadoInventarios() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Inventarios');
      this.lstInventarios = await this.inventariosService.obtenerInventarios();
      if (this.lstInventarios.length > 0) {
        this.lstInventariosFiltrados = [...this.lstInventarios];
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener el listado de inventarios', error.message);
      } else {
        this.toastrService.error('Error al obtener el listado de inventarios', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async ObtenerListadoProductosInventario() {
    try {
      this.loadingService.showLoading();
      this.lstProductosInventario = await this.inventariosService.obtenerProductosInventarios(this.idInventarioConsultar);
      if (this.lstProductosInventario.length > 0) {
        this.changeDetector.detectChanges();
        this.dtOptions = {
          data: this.lstProductosInventario,
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
            {
              title: 'Plan de cuentas',
              data: null,
              render: (data: any, type: string, row: any) => {
                const codigoCeco = row.producto.ceco.codigoCeco || '';
                const descripcionCeco = row.producto.ceco.descripcionCeco || '';
                return `${codigoCeco} - ${descripcionCeco}`;
              }
            },
            { title: 'Código', data: 'producto.codigoProducto' },
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
              title: 'Estado',
              data: 'estaActivo',
              render: (data: boolean) => {
                return data
                  ? '<span class="badge badge-pill badge-success" style="font-size:11px">Registrado</span>'
                  : '<span class="badge badge-pill badge-danger" style="font-size:11px">Pendiente</span>';
              },
              className: 'text-center',
              orderable: false
            },
            { title: 'Fecha Registro', data: 'fechaRegistro' }
          ],
          paging: false,
          responsive: false,
          autoWidth: false,
          scrollX: true,
          destroy: true,
        };

        if ($.fn.DataTable.isDataTable(this.tableBienesInventario.nativeElement)) {
          $(this.tableBienesInventario.nativeElement).DataTable().destroy();
        }
        this.dataTable = $(this.tableBienesInventario.nativeElement).DataTable(this.dtOptions);

      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener los bienes del inventario', error.message);
      } else {
        this.toastrService.error('Error al obtener los bienes del inventario', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  OnSubmit(): void {
    this.CrearInventario();
  }

  async CrearInventario() {
    try {
      this.loadingService.showLoading();
      if (this.inventarioForm.valid) {
        try {
          const inventarioData: IInventarioActivo = this.inventarioForm.value;
          const mensajeInsercion = await this.inventariosService.crearNuevoInventario(inventarioData);
          Swal.fire({
            text: mensajeInsercion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al crear el inventario', error.message);
          } else {
            this.toastrService.error('Error al crear el inventario', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.inventarioForm);
        this.toastrService.error('Error al crear el inventario', 'No se llenaron todos los campos necesarios.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al crear el inventario', error.message);
      } else {
        this.toastrService.error('Error al crear el inventario', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }


  descargarExcel(): void {
    this.generarListaExcel();
  }

  generarListaExcel(): void {
    if (this.lstProductosInventario.length > 0) {
      this.lstProductosInventarioExportar = [];
      this.lstProductosInventario.forEach(productoInventario => {
        let productoInventarioExportar = {
          'Tipo': productoInventario.producto.esBienaControl ? 'Bien de Control' : 'Activo',
          'Plan de cuentas': `${productoInventario.producto.ceco?.codigoCeco}-${productoInventario.producto.ceco?.descripcionCeco}`,
          'Código': productoInventario.producto.codigoProducto,
          'Marca': productoInventario.producto.modelo?.marca?.nombreMarca,
          'Modelo': productoInventario.producto.modelo?.nombreModelo,
          'Descripción': productoInventario.producto.nombreProducto,
          'Fc. de Adquisición': productoInventario.producto.fechaCompraProducto == null ? '' : this.formatearFecha(productoInventario.producto.fechaCompraProducto),
          'Valor de Compra': productoInventario.producto.valorCompraProducto,
          'Estado': productoInventario.estaActivo ? 'Registrado' : 'Pendiente',
          'Fc. de Registro': productoInventario.fechaRegistro,
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

  FilterInventarios(): void {
    const filterValue = this.inventarioControl.value!.toLowerCase();
    this.idInventarioConsultar = 0;
    this.lstInventariosFiltrados = this.lstInventarios.filter(inventario =>
      inventario.descripcionInventario.toLowerCase().includes(filterValue)
    );
  }

  SelectCustodio(inventario: IInventarioActivo): void {
    this.inventarioControl.setValue(inventario.descripcionInventario);
    this.idInventarioConsultar = inventario.idInventario;
    this.visualizarOpciones = false;
  }

  HideOptions(): void {
    setTimeout(() => this.visualizarOpciones = false, 200);
  }

  SetInactive() {
    this.homeComponent.SetInactive();
  }

  AbrirModal() {
    $('#inventarioModal').modal('show');
  }

  GetSpanishLanguage() {
    return SpanishLanguage;
  }

}
