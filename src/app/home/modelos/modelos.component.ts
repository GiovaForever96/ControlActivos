import { ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AppComponent } from 'src/app/app.component';
import { IModeloActivo } from 'src/app/models/modelo-activo';
import { LoadingService } from 'src/app/services/loading.service';
import { HomeComponent } from '../home.component';
import { ToastrService } from 'src/app/services/toastr.service';
import { ModeloActivoService } from 'src/app/services/modelo-activo.service';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import Swal from 'sweetalert2';
import { MarcaActivoService } from 'src/app/services/marca-activo.service';
import { IMarcaActivo } from 'src/app/models/marca-activo';
declare var $: any;

@Component({
  selector: 'app-modelos',
  templateUrl: './modelos.component.html',
  styleUrls: ['./modelos.component.css']
})
export class ModelosComponent {

  @ViewChild('dataTableModelos', { static: false }) tableModelos!: ElementRef;
  @ViewChild('btnActualizaModelo', { static: true }) btnActualizaMarca!: ElementRef;

  isEditing: boolean = false;
  lstModelos: IModeloActivo[] = [];
  lstMarcas: IMarcaActivo[] = [];
  lstMarcasFiltradas: IMarcaActivo[] = [];
  dtOptions: any;
  dataTable: any;
  modeloForm!: FormGroup;
  marcaControl = new FormControl('', Validators.required);
  visualizarOpciones = false;

  constructor(private loadingService: LoadingService,
    private appComponent: AppComponent,
    private modelosService: ModeloActivoService,
    private marcasService: MarcaActivoService,
    private homeComponent: HomeComponent,
    private fb: FormBuilder,
    private el: ElementRef,
    private renderer: Renderer2,
    private changeDetector: ChangeDetectorRef,
    private toastrService: ToastrService) { }

  ngOnInit(): void {
    (window as any).EliminarModelo = this.EliminarModelo.bind(this);
    (window as any).EditarModelo = this.EditarModelo.bind(this);
    this.CargarListadoModelos();
    this.CrearModeloForm();
    const body = this.el.nativeElement.ownerDocument.body;
    this.renderer.setStyle(body, 'overflow', '');
  }

  async CargarListadoModelos() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Modelos');
      this.lstModelos = await this.modelosService.obtenerModelos();
      this.lstMarcas = await this.marcasService.obtenerMarcas();
      if (this.lstMarcas.length > 0)
        this.lstMarcasFiltradas = [...this.lstMarcas];
      this.dtOptions = {
        data: this.lstModelos,
        info: false,
        language: {
          ...this.GetSpanishLanguage()
        },
        columns: [
          { title: 'Id.', data: 'idModelo' },
          { title: 'Marca', data: 'marca.nombreMarca' },
          { title: 'Modelo', data: 'nombreModelo' },
          {
            targets: -2,
            searchable: false,
            render: function (data: any, type: any, full: any, meta: any) {
              return `<button type="button" class="btn btn-primary btn-sm" onclick="EditarModelo(${full.idModelo})"><i class="fas fa-edit"></i></button>`;
            },
            className: 'text-center btn-acciones-column'
          },
          {
            targets: -1,
            orderable: false,
            searchable: false,
            render: function (data: any, type: any, full: any, meta: any) {
              return `<button type="button" class="btn btn-danger btn-sm" onclick="EliminarModelo(${full.idModelo})"><i class="fas fa-trash-alt"></i></button>`;
            },
            className: 'text-center btn-acciones-column'
          }
        ],
        columnDefs: [
          {
            targets: [3, 4],
            orderable: false,
            searchable: false,
            width: '50px'
          }
        ],
        responsive: false,
        autoWidth: false,
        scrollX: true,
      };
      this.dataTable = $(this.tableModelos.nativeElement);
      this.dataTable.DataTable(this.dtOptions);
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener los modelos', error.message);
      } else {
        this.toastrService.error('Error al obtener los modelos', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  CrearModeloForm() {
    this.marcaControl = new FormControl('', Validators.required);
    this.modeloForm = this.fb.group({
      idModelo: [0, [Validators.required]],
      idMarca: ['', [Validators.required]],
      nombreModelo: ['', [Validators.required, Validators.maxLength(100)]],
      estaActivo: [true, [Validators.required]]
    });
  }

  SetInactive() {
    this.homeComponent.SetInactive();
  }

  async EliminarModelo(idModelo: number) {
    try {
      const modeloSeleccionado = this.lstModelos.find(x => x.idModelo == idModelo);
      const result = await Swal.fire({
        title: `¿Estás seguro de eliminar el modelo ${modeloSeleccionado!.nombreModelo}?`,
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
          title: 'Eliminando modelo...',
          text: 'Por favor espere.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        try {
          const mensajeEliminacion = await this.modelosService.eliminarModelo(idModelo);
          Swal.fire({
            text: `${mensajeEliminacion}: ${modeloSeleccionado!.nombreModelo}`,
            icon: 'success'
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          this.toastrService.error('Error al eliminar el modelo del activo', 'Solicitar soporte al departamento de TI.');
          Swal.close();
        }
      } else {
        this.toastrService.info('Operación cancelada', 'El usuario cancelo la acción de eliminar el modelo');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al eliminar el modelo del activo', error.message);
      } else {
        this.toastrService.error('Error al eliminar el modelo del activo', 'Solicitar soporte al departamento de TI.');
      }
    }
  }

  OnSubmit() {
    if (this.isEditing) {
      this.ActualizarModelo();
    } else {
      this.CrearModelo();
    }
  }

  AbrirModal(esEdicion: boolean) {
    this.isEditing = esEdicion;
    if (!esEdicion) {
      this.CrearModeloForm();
    }
    $('#marcaModal').modal('show');
  }

  EditarModelo(idModelo: number) {
    const modeloActualizar = this.lstModelos.find(x => x.idModelo == idModelo);

    this.modeloForm = this.fb.group({
      idModelo: [modeloActualizar!.idModelo, [Validators.required]],
      idMarca: [modeloActualizar!.idMarca, [Validators.required]],
      nombreModelo: [modeloActualizar!.nombreModelo, [Validators.required, Validators.maxLength(100)]],
      estaActivo: [modeloActualizar!.estaActivo, [Validators.required]]
    });

    this.marcaControl.setValue(modeloActualizar!.marca!.nombreMarca);
    this.changeDetector.detectChanges();
    this.btnActualizaMarca.nativeElement.click();
  }

  async CrearModelo() {
    try {
      this.loadingService.showLoading();
      if (this.modeloForm.valid) {
        try {
          const modeloData: IModeloActivo = this.modeloForm.value;
          const mensajeInsercion = await this.modelosService.insertarModelo(modeloData);
          Swal.fire({
            text: mensajeInsercion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al agregar el modelo', error.message);
          } else {
            this.toastrService.error('Error al agregar el modelo', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.modeloForm);
        this.toastrService.error('Error al agregar el modelo', 'No se llenaron todos los campos necesarios.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al agregar el modelo', error.message);
      } else {
        this.toastrService.error('Error al agregar el modelo', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async ActualizarModelo() {
    try {
      this.loadingService.showLoading();
      if (this.marcaControl.value == '') {
        this.modeloForm.patchValue({ 'idMarca': '' });
      }
      if (this.modeloForm.valid) {
        try {
          const modeloActualizadoData: IModeloActivo = this.modeloForm.value;
          const mensajeActualizacion = await this.modelosService.actualizarModelo(modeloActualizadoData.idModelo, modeloActualizadoData);
          Swal.fire({
            text: mensajeActualizacion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al actualizar el modelo', error.message);
          } else {
            this.toastrService.error('Error al actualizar el modelo', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.modeloForm);
        this.toastrService.error('Error al actualizar el modelo', 'No se llenaron todos los campos necesarios.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al actualizar el modelo', error.message);
      } else {
        this.toastrService.error('Error al actualizar el modelo', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  FilterMarcas(): void {
    const filterValue = this.marcaControl.value!.toLowerCase();
    this.lstMarcasFiltradas = this.lstMarcas.filter(marca =>
      marca.nombreMarca.toLowerCase().includes(filterValue)
    );
  }

  SelectMarca(marca: IMarcaActivo): void {
    this.marcaControl.setValue(marca.nombreMarca);
    this.modeloForm.get('idMarca')!.setValue(marca.idMarca);
    this.visualizarOpciones = false;
  }

  HideOptions(): void {
    setTimeout(() => this.visualizarOpciones = false, 200);
  }

  GetSpanishLanguage() {
    return SpanishLanguage;
  }

}
