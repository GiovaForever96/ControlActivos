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
            { title: 'Código', data: 'producto.codigoProducto' },
            { title: 'Id', data: 'producto.codigoAuxiliar' },
            {
              title: 'Tipo',
              data: 'producto.esBienaControl',
              render: (data: boolean) => data ? 'Bien de control' : 'Activo'
            },
            { title: 'Centro de costo', data: 'producto.ceco.descripcionCeco' },
            { title: 'Marca', data: 'producto.modelo.marca.nombreMarca' },
            { title: 'Modelo', data: 'producto.modelo.nombreModelo' },
            { title: 'Descripción', data: 'producto.nombreProducto' },
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
