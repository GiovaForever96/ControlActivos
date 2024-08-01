import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { ICustodioActivo } from 'src/app/models/custodio-activo';
import { LoadingService } from 'src/app/services/loading.service';
import { HomeComponent } from '../home.component';
import { CustodioActivoService } from 'src/app/services/custodio-activo.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'src/app/services/toastr.service';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-custodios',
  templateUrl: './custodios.component.html',
  styleUrls: ['./custodios.component.css']
})
export class CustodiosComponent {

  @ViewChild('dataTableCustodios', { static: false }) tableCustodios!: ElementRef;
  @ViewChild('btnActualizaCustodio', { static: true }) btnActualizaCustodio!: ElementRef;

  isEditing: boolean = false;
  lstCustodios: ICustodioActivo[] = [];
  dtOptions: any;
  dataTable: any;
  custodioForm!: FormGroup;

  constructor(private loadingService: LoadingService,
    private appComponent: AppComponent,
    private homeComponent: HomeComponent,
    private custodiosService: CustodioActivoService,
    private fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private toastrService: ToastrService) { }

  ngOnInit(): void {
    (window as any).EliminarCustodio = this.EliminarCustodio.bind(this);
    (window as any).EditarCustodio = this.EditarCustodio.bind(this);
    this.CargarListadoCustodios();
    this.CrearCustodioForm();
  }

  CrearCustodioForm() {
    this.custodioForm = this.fb.group({
      idCustodio: [0, [Validators.required]],
      nombreApellidoCustodio: ['', [Validators.required, Validators.maxLength(300)]],
      estaActivo: [true, [Validators.required]]
    });
  }

  async CargarListadoCustodios() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Custodios');
      this.lstCustodios = await this.custodiosService.obtenerCustodios();
      this.dtOptions = {
        data: this.lstCustodios,
        info: false,
        language: {
          ...this.GetSpanishLanguage()
        },
        columns: [
          { title: 'Id.', data: 'idCustodio' },
          { title: 'Apellidos y Nombres', data: 'nombreApellidoCustodio' },
          {
            targets: -2,
            searchable: false,
            render: function (data: any, type: any, full: any, meta: any) {
              return `<button type="button" class="btn btn-primary btn-sm" onclick="EditarCustodio(${full.idCustodio})"><i class="fas fa-edit"></i></button>`;
            },
            className: 'text-center btn-acciones-column'
          },
          {
            targets: -1,
            orderable: false,
            searchable: false,
            render: function (data: any, type: any, full: any, meta: any) {
              return `<button type="button" class="btn btn-danger btn-sm" onclick="EliminarCustodio(${full.idCustodio})"><i class="fas fa-trash-alt"></i></button>`;
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
      this.dataTable = $(this.tableCustodios.nativeElement);
      this.dataTable.DataTable(this.dtOptions);
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener los custodios', error.message);
      } else {
        this.toastrService.error('Error al obtener los custodios', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async EliminarCustodio(idCustodio: number) {
    try {
      const custodioSeleccionado = this.lstCustodios.find(x => x.idCustodio == idCustodio);
      const result = await Swal.fire({
        title: `¿Estás seguro de eliminar el custodio ${custodioSeleccionado!.nombreApellidoCustodio}?`,
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
          title: 'Eliminando custodio...',
          text: 'Por favor espere.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        try {
          const mensajeEliminacion = await this.custodiosService.eliminarCustodio(idCustodio);
          Swal.fire({
            text: `${mensajeEliminacion}: ${custodioSeleccionado!.nombreApellidoCustodio}`,
            icon: 'success'
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          this.toastrService.error('Error al eliminar el custodio del activo', 'Solicitar soporte al departamento de TI.');
          Swal.close();
        }
      } else {
        this.toastrService.info('Operación cancelada', 'El usuario cancelo la acción de eliminar el custodio');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al eliminar el custodio del activo', error.message);
      } else {
        this.toastrService.error('Error al eliminar el custodio del activo', 'Solicitar soporte al departamento de TI.');
      }
    }
  }

  EditarCustodio(idCustodio: number) {
    const custodioActualizar = this.lstCustodios.find(x => x.idCustodio == idCustodio);
    this.custodioForm = this.fb.group({
      idCustodio: [custodioActualizar!.idCustodio, [Validators.required]],
      nombreApellidoCustodio: [custodioActualizar!.nombreApellidoCustodio, [Validators.required, Validators.maxLength(300)]],
      estaActivo: [custodioActualizar!.estaActivo, [Validators.required]]
    });
    this.changeDetector.detectChanges();
    this.btnActualizaCustodio.nativeElement.click();
  }

  AbrirModal(esEdicion: boolean) {
    this.isEditing = esEdicion;
    if (!esEdicion) {
      this.CrearCustodioForm();
    }
    $('#custodioModal').modal('show');
  }

  OnSubmit(): void {
    if (this.isEditing) {
      this.ActualizarCustodio();
    } else {
      this.CrearCustodio();
    }
  }

  async CrearCustodio() {
    try {
      this.loadingService.showLoading();
      if (this.custodioForm.valid) {
        try {
          const custodioData: ICustodioActivo = this.custodioForm.value;
          custodioData.nombreApellidoCustodio = custodioData.nombreApellidoCustodio.toUpperCase();
          await this.custodiosService.insertarCustodio(custodioData);
          Swal.fire({
            text: "El custodio ha sido agregado correctamente",
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al agregar el custodio', error.message);
          } else {
            this.toastrService.error('Error al agregar el custodio', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.custodioForm);
        this.toastrService.error('Error al agregar el custodio', 'No se llenaron todos los campos necesarios.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al agregar el custodio', error.message);
      } else {
        this.toastrService.error('Error al agregar el custodio', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async ActualizarCustodio() {
    try {
      this.loadingService.showLoading();
      if (this.custodioForm.valid) {
        try {
          const custodioActualizadoData: ICustodioActivo = this.custodioForm.value;
          const mensajeActualizacion = await this.custodiosService.actualizarCustodio(custodioActualizadoData.idCustodio, custodioActualizadoData);
          Swal.fire({
            text: mensajeActualizacion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al actualizar el custodio', error.message);
          } else {
            this.toastrService.error('Error al actualizar el custodio', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.custodioForm);
        this.toastrService.error('Error al actualizar el custodio', 'No se llenaron todos los campos necesarios.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al actualizar el custodio', error.message);
      } else {
        this.toastrService.error('Error al actualizar el custodio', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  SetInactive() {
    this.homeComponent.SetInactive();
  }

  GetSpanishLanguage() {
    return SpanishLanguage;
  }

}
