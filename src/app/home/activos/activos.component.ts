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
          { title: 'Centro Costo', data: 'producto.ceco.descripcionCeco' },
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
