import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { IMarcaActivo } from 'src/app/models/marca-activo';
import { LoadingService } from 'src/app/services/loading.service';
import { MarcaActivoService } from 'src/app/services/marca-activo.service';
import { ToastrService } from 'src/app/services/toastr.service';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import { HomeComponent } from '../home.component';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $: any;


@Component({
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.css']
})
export class MarcasComponent implements OnInit {

  @ViewChild('dataTableMarcas', { static: false }) tableMarcas!: ElementRef;
  @ViewChild('btnActualizaMarca', { static: true }) btnActualizaMarca!: ElementRef;

  isEditing: boolean = false;
  lstMarcas: IMarcaActivo[] = [];
  dtOptions: any;
  dataTable: any;
  marcaForm!: FormGroup;


  constructor(private loadingService: LoadingService,
    private appComponent: AppComponent,
    private homeComponent: HomeComponent,
    private marcasService: MarcaActivoService,
    private fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private toastrService: ToastrService) { }

  ngOnInit(): void {
    (window as any).EliminarMarca = this.EliminarMarca.bind(this);
    (window as any).EditarMarca = this.EditarMarca.bind(this);
    this.CargarListadoMarcas();
    this.CrearMarcaForm();
  }

  CrearMarcaForm() {
    this.marcaForm = this.fb.group({
      idMarca: [0, [Validators.required]],
      nombreMarca: ['', [Validators.required, Validators.maxLength(300)]],
      estaActivo: [true, [Validators.required]]
    });
  }

  async CargarListadoMarcas() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Marcas');
      this.lstMarcas = await this.marcasService.obtenerMarcas();
      this.dtOptions = {
        data: this.lstMarcas,
        info: false,
        language: {
          ...this.GetSpanishLanguage()
        },
        columns: [
          { title: 'Id.', data: 'idMarca' },
          { title: 'Marca', data: 'nombreMarca' },
          {
            targets: -2,
            searchable: false,
            render: function (data: any, type: any, full: any, meta: any) {
              return `<button type="button" class="btn btn-primary btn-sm" onclick="EditarMarca(${full.idMarca})"><i class="fas fa-edit"></i></button>`;
            },
            className: 'text-center btn-acciones-column'
          },
          {
            targets: -1,
            orderable: false,
            searchable: false,
            render: function (data: any, type: any, full: any, meta: any) {
              return `<button type="button" class="btn btn-danger btn-sm" onclick="EliminarMarca(${full.idMarca})"><i class="fas fa-trash-alt"></i></button>`;
            },
            className: 'text-center btn-acciones-column'
          }
        ],
        columnDefs: [
          {
            targets: [2, 3],
            orderable: false,
            searchable: false,
            width: '50px'
          }
        ],
        responsive: false,
        autoWidth: false,
        scrollX: true,
      };
      this.dataTable = $(this.tableMarcas.nativeElement);
      this.dataTable.DataTable(this.dtOptions);
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener las marcas', error.message);
      } else {
        this.toastrService.error('Error al obtener las marcas', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async EliminarMarca(idMarca: number) {
    try {
      const marcaSeleccionada = this.lstMarcas.find(x => x.idMarca == idMarca);
      const result = await Swal.fire({
        title: `¿Estás seguro de eliminar la marca ${marcaSeleccionada!.nombreMarca}?`,
        text: 'Esta acción no se podrá revertir.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, eliminar',
        cancelButtonText: 'Cancelar'
      });
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando marca...',
          text: 'Por favor espere.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        try {
          const mensajeEliminacion = await this.marcasService.eliminarMarca(idMarca);
          Swal.fire({
            text: `${mensajeEliminacion}: ${marcaSeleccionada!.nombreMarca}`,
            icon: 'success'
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          this.toastrService.error('Error al eliminar la marca del activo', 'Solicitar soporte al departamento de TI.');
          Swal.close();
        }
      } else {
        this.toastrService.info('Operación cancelada', 'El usuario cancelo la acción de eliminar la marca');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al eliminar la marca del activo', error.message);
      } else {
        this.toastrService.error('Error al eliminar la marca del activo', 'Solicitar soporte al departamento de TI.');
      }
    }
  }

  EditarMarca(idMarca: number) {
    const marcaActualizar = this.lstMarcas.find(x => x.idMarca == idMarca);
    this.marcaForm = this.fb.group({
      idMarca: [marcaActualizar!.idMarca, [Validators.required]],
      nombreMarca: [marcaActualizar!.nombreMarca, [Validators.required, Validators.maxLength(300)]],
      estaActivo: [marcaActualizar!.estaActivo, [Validators.required]]
    });
    this.changeDetector.detectChanges();
    this.btnActualizaMarca.nativeElement.click();
  }

  SetInactive() {
    this.homeComponent.SetInactive();
  }

  AbrirModal(esEdicion: boolean) {
    this.isEditing = esEdicion;
    if (!esEdicion) {
      this.CrearMarcaForm();
    }
    $('#marcaModal').modal('show');
  }

  OnSubmit(): void {
    if (this.isEditing) {
      this.ActualizarMarca();
    } else {
      this.CrearMarca();
    }
  }

  async CrearMarca() {
    try {
      this.loadingService.showLoading();
      if (this.marcaForm.valid) {
        try {
          const marcaData: IMarcaActivo = this.marcaForm.value;
          const mensajeInsercion = await this.marcasService.insertarMarca(marcaData);
          Swal.fire({
            text: mensajeInsercion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al agregar la marca', error.message);
          } else {
            this.toastrService.error('Error al agregar la marca', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.marcaForm);
        this.toastrService.error('Error al agregar la marca', 'No se llenaron todos los campos necesarios.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al agregar la marca', error.message);
      } else {
        this.toastrService.error('Error al agregar la marca', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async ActualizarMarca() {
    try {
      this.loadingService.showLoading();
      if (this.marcaForm.valid) {
        try {
          const marcaActualizadoData: IMarcaActivo = this.marcaForm.value;
          const mensajeActualizacion = await this.marcasService.actualizarMarca(marcaActualizadoData.idMarca, marcaActualizadoData);
          Swal.fire({
            text: mensajeActualizacion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al actualizar la marca', error.message);
          } else {
            this.toastrService.error('Error al actualizar la marca', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.marcaForm);
        this.toastrService.error('Error al actualizar la marca', 'No se llenaron todos los campos necesarios.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al actualizar la marca', error.message);
      } else {
        this.toastrService.error('Error al actualizar la marca', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  GetSpanishLanguage() {
    return SpanishLanguage;
  }

}
