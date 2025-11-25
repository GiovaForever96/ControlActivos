import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { ICargoActivo } from 'src/app/models/cargo-activo';
import { LoadingService } from 'src/app/services/loading.service';
import { CargoActivoService } from 'src/app/services/cargo-activo.service';
import { ToastrService } from 'src/app/services/toastr.service';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import { HomeComponent } from '../home.component';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
declare var $: any;

@Component({
  selector: 'app-cargos',
  templateUrl: './cargos.component.html',
  styleUrls: ['./cargos.component.css'],
})
export class CargosComponent implements OnInit {
  @ViewChild('dataTableCargos', { static: false })
  tableCargos!: ElementRef;
  @ViewChild('btnActualizaCargo', { static: true })
  btnActualizaCargo!: ElementRef;

  isEditing: boolean = false;
  lstCargos: ICargoActivo[] = [];
  dtOptions: any;
  dataTable: any;
  cargoForm!: FormGroup;

  constructor(
    private loadingService: LoadingService,
    private appComponent: AppComponent,
    private homeComponent: HomeComponent,
    private cargosService: CargoActivoService,
    private fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    (window as any).EliminarCargo = this.EliminarCargo.bind(this);
    (window as any).EditarCargo = this.EditarCargo.bind(this);
    this.CargarListadoCargos();
    this.CrearCargoForm();
    const body = this.el.nativeElement.ownerDocument.body;
    this.renderer.setStyle(body, 'overflow', '');
  }

  CrearCargoForm() {
    this.cargoForm = this.fb.group({
      idCargo: [0, [Validators.required]],
      nombreCargo: ['', [Validators.required, Validators.maxLength(300)]],
      estaActivo: [true, [Validators.required]],
    });
  }

  async CargarListadoCargos() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Cargos');
      this.lstCargos = await this.cargosService.obtenerCargos();
      this.dtOptions = {
        data: this.lstCargos,
        info: false,
        language: {
          ...this.GetSpanishLanguage(),
        },
        columns: [
          {
            title: 'Id.',
            data: 'idCargo',
            width: '50px',
          },
          { title: 'Cargo', data: 'nombreCargo' },
          {
            targets: -1,
            orderable: false,
            searchable: false,
            render: function (data: any, type: any, full: any, meta: any) {
              return `
              <button type="button" class="btn btn-primary btn-sm ml-2 mr-2" onclick="EditarCargo(${full.idCargo})"><i class="fas fa-edit"></i></button>
              <button type="button" class="btn btn-danger btn-sm" onclick="EliminarCargo(${full.idCargo})"><i class="fas fa-trash-alt"></i></button>`;
            },
            className: 'text-center btn-acciones-column',
            width: '100px',
          },
        ],
        responsive: false,
        autoWidth: false,
        scrollX: true,
        ordering: false,
      };
      this.dataTable = $(this.tableCargos.nativeElement);
      this.dataTable.DataTable(this.dtOptions);
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener los cargos', error.message);
      } else {
        this.toastrService.error(
          'Error al obtener los cargos',
          'Solicitar soporte al departamento de TI.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async EliminarCargo(idCargo: number) {
    try {
      const cargoSeleccionado = this.lstCargos.find(
        (x) => x.idCargo == idCargo
      );
      const result = await Swal.fire({
        title: `¿Estás seguro de eliminar el cargo ${
          cargoSeleccionado!.nombreCargo
        }?`,
        text: 'Esta acción no se podrá revertir.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, eliminar',
        cancelButtonText: 'Cancelar',
      });
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando cargo...',
          text: 'Por favor espere.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          const mensajeEliminacion = await this.cargosService.eliminarCargo(
            idCargo
          );
          Swal.fire({
            text: `${mensajeEliminacion}`,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          this.toastrService.error(
            'Error al eliminar el cargo del activo',
            'Solicitar soporte al departamento de TI.'
          );
          Swal.close();
        }
      } else {
        this.toastrService.info(
          'Operación cancelada',
          'El usuario cancelo la acción de eliminar el cargo'
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error(
          'Error al eliminar el cargo del activo',
          error.message
        );
      } else {
        this.toastrService.error(
          'Error al eliminar el cargo del activo',
          'Solicitar soporte al departamento de TI.'
        );
      }
    }
  }

  EditarCargo(idCargo: number) {
    const cargoActualizar = this.lstCargos.find((x) => x.idCargo == idCargo);
    this.cargoForm = this.fb.group({
      idCargo: [cargoActualizar!.idCargo, [Validators.required]],
      nombreCargo: [
        cargoActualizar!.nombreCargo,
        [Validators.required, Validators.maxLength(300)],
      ],
      estaActivo: [cargoActualizar!.estaActivo, [Validators.required]],
    });
    this.changeDetector.detectChanges();
    this.btnActualizaCargo.nativeElement.click();
  }

  SetInactive() {
    this.homeComponent.SetInactive();
  }

  AbrirModal(esEdicion: boolean) {
    this.isEditing = esEdicion;
    if (!esEdicion) {
      this.CrearCargoForm();
    }
    $('#cargoModal').modal('show');
  }

  OnSubmit(): void {
    let cargo = this.cargoForm.get('nombreCargo')?.value;
    if (cargo.trim().length === 0) {
      this.toastrService.error(
        'Error al guardar el cargo',
        'El nombre del cargo no puede estar vacío o contener solo espacios.'
      );
      return;
    }
    if (this.isEditing) {
      this.ActualizarCargo();
    } else {
      this.CrearCargo();
    }
  }

  async CrearCargo() {
    try {
      this.loadingService.showLoading();
      if (this.cargoForm.valid) {
        try {
          const cargoData: ICargoActivo = this.cargoForm.value;
          cargoData.nombreCargo = cargoData.nombreCargo.trim();
          const mensajeInsercion = await this.cargosService.insertarCargo(
            cargoData
          );
          Swal.fire({
            text: mensajeInsercion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error(
              'Error al agregar el cargo',
              error.message
            );
          } else {
            this.toastrService.error(
              'Error al agregar el cargo',
              'Solicitar soporte al departamento de TI.'
            );
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.cargoForm);
        this.toastrService.error(
          'Error al agregar el cargo',
          'No se llenaron todos los campos necesarios.'
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al agregar el cargo', error.message);
      } else {
        this.toastrService.error(
          'Error al agregar el cargo',
          'Solicitar soporte al departamento de TI.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async ActualizarCargo() {
    try {
      this.loadingService.showLoading();
      if (this.cargoForm.valid) {
        try {
          const cargoActualizadoData: ICargoActivo = this.cargoForm.value;
          const mensajeActualizacion = await this.cargosService.actualizarCargo(
            cargoActualizadoData.idCargo,
            cargoActualizadoData
          );
          Swal.fire({
            text: mensajeActualizacion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error(
              'Error al actualizar el cargo',
              error.message
            );
          } else {
            this.toastrService.error(
              'Error al actualizar el cargo',
              'Solicitar soporte al departamento de TI.'
            );
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.cargoForm);
        this.toastrService.error(
          'Error al actualizar el cargo',
          'No se llenaron todos los campos necesarios.'
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al actualizar el cargo', error.message);
      } else {
        this.toastrService.error(
          'Error al actualizar el cargo',
          'Solicitar soporte al departamento de TI.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  GetSpanishLanguage() {
    return SpanishLanguage;
  }

  descargarTable() {
    const columnas = [
      { key: 'idCargo', header: 'ID Cargo' },
      { key: 'nombreCargo', header: 'Nombre del Cargo' },
    ];
    const cargos = this.lstCargos.map((car) => {
      const row: Record<string, any> = {};
      columnas.forEach((col) => {
        row[col.header] = car[col.key as keyof ICargoActivo];
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(cargos);
    const headers = Object.keys(cargos[0]);
    ws['!cols'] = headers.map((h) => {
      const max = Math.max(
        h.length,
        ...cargos.map((r) => (r[h] ? String(r[h]).length : 0))
      );
      return { wch: max + 2 };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cargos');
    XLSX.writeFile(wb, 'Cargos.xlsx');
  }
}
