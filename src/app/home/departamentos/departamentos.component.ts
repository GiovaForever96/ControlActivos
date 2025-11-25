import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { IDepartamentoActivo } from 'src/app/models/departamento-activo';
import { LoadingService } from 'src/app/services/loading.service';
import { DepartamentoActivoService } from 'src/app/services/departamento-activo.service';
import { ToastrService } from 'src/app/services/toastr.service';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import { HomeComponent } from '../home.component';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
declare var $: any;

@Component({
  selector: 'app-departamentos',
  templateUrl: './departamentos.component.html',
  styleUrls: ['./departamentos.component.css'],
})
export class DepartamentosComponent implements OnInit {
  @ViewChild('dataTableDepartamentos', { static: false })
  tableDepartamentos!: ElementRef;
  @ViewChild('btnActualizaDepartamento', { static: true })
  btnActualizaDepartamento!: ElementRef;

  isEditing: boolean = false;
  lstDepartamentos: IDepartamentoActivo[] = [];
  dtOptions: any;
  dataTable: any;
  departamentoForm!: FormGroup;

  constructor(
    private loadingService: LoadingService,
    private appComponent: AppComponent,
    private homeComponent: HomeComponent,
    private departamentosService: DepartamentoActivoService,
    private fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    (window as any).EliminarDepartamento = this.EliminarDepartamento.bind(this);
    (window as any).EditarDepartamento = this.EditarDepartamento.bind(this);
    this.CargarListadoDepartamentos();
    this.CrearDepartamentoForm();
    const body = this.el.nativeElement.ownerDocument.body;
    this.renderer.setStyle(body, 'overflow', '');
  }

  CrearDepartamentoForm() {
    this.departamentoForm = this.fb.group({
      idDepartamento: [0, [Validators.required]],
      nombreDepartamento: [
        '',
        [Validators.required, Validators.maxLength(300)],
      ],
      estaActivo: [true, [Validators.required]],
    });
  }

  async CargarListadoDepartamentos() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Departamentos');
      this.lstDepartamentos =
        await this.departamentosService.obtenerDepartamentos();
      this.dtOptions = {
        data: this.lstDepartamentos,
        info: false,
        language: {
          ...this.GetSpanishLanguage(),
        },
        columns: [
          {
            title: 'Id.',
            data: 'idDepartamento',
            width: '50px',
          },
          { title: 'Departamento', data: 'nombreDepartamento' },
          {
            targets: -1,
            orderable: false,
            searchable: false,
            render: function (data: any, type: any, full: any, meta: any) {
              return `
              <button type="button" class="btn btn-primary btn-sm" onclick="EditarDepartamento(${full.idDepartamento})"><i class="fas fa-edit"></i></button>
              <button type="button" class="btn btn-danger btn-sm" onclick="EliminarDepartamento(${full.idDepartamento})"><i class="fas fa-trash-alt"></i></button>`;
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
      this.dataTable = $(this.tableDepartamentos.nativeElement);
      this.dataTable.DataTable(this.dtOptions);
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error(
          'Error al obtener los departamentos',
          error.message
        );
      } else {
        this.toastrService.error(
          'Error al obtener los departamentos',
          'Solicitar soporte al departamento de TI.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async EliminarDepartamento(idDepartamento: number) {
    try {
      const departamentoSeleccionado = this.lstDepartamentos.find(
        (x) => x.idDepartamento == idDepartamento
      );
      const result = await Swal.fire({
        title: `¿Estás seguro de eliminar el departamento ${
          departamentoSeleccionado!.nombreDepartamento
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
          title: 'Eliminando departamento...',
          text: 'Por favor espere.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          const mensajeEliminacion =
            await this.departamentosService.eliminarDepartamento(
              idDepartamento
            );
          Swal.fire({
            text: `${mensajeEliminacion}`,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          this.toastrService.error(
            'Error al eliminar el departamento del activo',
            'Solicitar soporte al departamento de TI.'
          );
          Swal.close();
        }
      } else {
        this.toastrService.info(
          'Operación cancelada',
          'El usuario cancelo la acción de eliminar el departamento'
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error(
          'Error al eliminar el departamento del activo',
          error.message
        );
      } else {
        this.toastrService.error(
          'Error al eliminar el departamento del activo',
          'Solicitar soporte al departamento de TI.'
        );
      }
    }
  }

  EditarDepartamento(idDepartamento: number) {
    const departamentoActualizar = this.lstDepartamentos.find(
      (x) => x.idDepartamento == idDepartamento
    );
    this.departamentoForm = this.fb.group({
      idDepartamento: [
        departamentoActualizar!.idDepartamento,
        [Validators.required],
      ],
      nombreDepartamento: [
        departamentoActualizar!.nombreDepartamento,
        [Validators.required, Validators.maxLength(300)],
      ],
      estaActivo: [departamentoActualizar!.estaActivo, [Validators.required]],
    });
    this.changeDetector.detectChanges();
    this.btnActualizaDepartamento.nativeElement.click();
  }

  SetInactive() {
    this.homeComponent.SetInactive();
  }

  AbrirModal(esEdicion: boolean) {
    this.isEditing = esEdicion;
    if (!esEdicion) {
      this.CrearDepartamentoForm();
    }
    $('#departamentoModal').modal('show');
  }

  OnSubmit(): void {
    let departamento = this.departamentoForm.get('nombreDepartamento')?.value;
    if (departamento.trim().length === 0) {
      this.toastrService.error(
        'Error al guardar el departamento',
        'El nombre del departamento no puede estar vacío o contener solo espacios.'
      );
      return;
    }
    if (this.isEditing) {
      this.ActualizarDepartamento();
    } else {
      this.CrearDepartamento();
    }
  }

  async CrearDepartamento() {
    try {
      this.loadingService.showLoading();
      if (this.departamentoForm.valid) {
        try {
          const departamentoData: IDepartamentoActivo =
            this.departamentoForm.value;
          departamentoData.nombreDepartamento =
            departamentoData.nombreDepartamento.trim();
          const mensajeInsercion =
            await this.departamentosService.insertarDepartamento(
              departamentoData
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
              'Error al agregar el departamento',
              error.message
            );
          } else {
            this.toastrService.error(
              'Error al agregar el departamento',
              'Solicitar soporte al departamento de TI.'
            );
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.departamentoForm);
        this.toastrService.error(
          'Error al agregar el departamento',
          'No se llenaron todos los campos necesarios.'
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error(
          'Error al agregar el departamento',
          error.message
        );
      } else {
        this.toastrService.error(
          'Error al agregar el departamento',
          'Solicitar soporte al departamento de TI.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async ActualizarDepartamento() {
    try {
      this.loadingService.showLoading();
      if (this.departamentoForm.valid) {
        try {
          const departamentoActualizadoData: IDepartamentoActivo =
            this.departamentoForm.value;
          const mensajeActualizacion =
            await this.departamentosService.actualizarDepartamento(
              departamentoActualizadoData.idDepartamento,
              departamentoActualizadoData
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
              'Error al actualizar el departamento',
              error.message
            );
          } else {
            this.toastrService.error(
              'Error al actualizar el departamento',
              'Solicitar soporte al departamento de TI.'
            );
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.departamentoForm);
        this.toastrService.error(
          'Error al actualizar el departamento',
          'No se llenaron todos los campos necesarios.'
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error(
          'Error al actualizar el departamento',
          error.message
        );
      } else {
        this.toastrService.error(
          'Error al actualizar el departamento',
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
      { key: 'idDepartamento', header: 'ID Departamento' },
      { key: 'nombreDepartamento', header: 'Nombre del Departamento' },
    ];
    const departamentos = this.lstDepartamentos.map((dep) => {
      const row: Record<string, any> = {};
      columnas.forEach((col) => {
        row[col.header] = dep[col.key as keyof IDepartamentoActivo];
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(departamentos);
    const headers = Object.keys(departamentos[0]);
    ws['!cols'] = headers.map((h) => {
      const max = Math.max(
        h.length,
        ...departamentos.map((r) => (r[h] ? String(r[h]).length : 0))
      );
      return { wch: max + 2 };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Departamentos');
    XLSX.writeFile(wb, 'Departamentos.xlsx');
  }
}
