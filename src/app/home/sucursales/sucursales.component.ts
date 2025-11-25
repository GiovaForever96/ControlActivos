import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { ISucursalActivo } from 'src/app/models/sucursal-activo';
import { LoadingService } from 'src/app/services/loading.service';
import { SucursalActivoService } from 'src/app/services/sucursal-activo.service';
import { ToastrService } from 'src/app/services/toastr.service';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import { HomeComponent } from '../home.component';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
declare var $: any;

@Component({
  selector: 'app-sucursales',
  templateUrl: './sucursales.component.html',
  styleUrls: ['./sucursales.component.css'],
})
export class SucursalesComponent implements OnInit {
  @ViewChild('dataTableSucursales', { static: false })
  tableSucursales!: ElementRef;
  @ViewChild('btnActualizaSucursal', { static: true })
  btnActualizaSucursal!: ElementRef;

  isEditing: boolean = false;
  lstSucursales: ISucursalActivo[] = [];
  dtOptions: any;
  dataTable: any;
  sucursalForm!: FormGroup;

  constructor(
    private loadingService: LoadingService,
    private appComponent: AppComponent,
    private homeComponent: HomeComponent,
    private sucursalesService: SucursalActivoService,
    private fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    (window as any).EliminarSucursal = this.EliminarSucursal.bind(this);
    (window as any).EditarSucursal = this.EditarSucursal.bind(this);
    this.CargarListadoSucursales();
    this.CrearSucursalForm();
    const body = this.el.nativeElement.ownerDocument.body;
    this.renderer.setStyle(body, 'overflow', '');
  }

  CrearSucursalForm() {
    this.sucursalForm = this.fb.group({
      idSucursal: [0, [Validators.required]],
      descripcionSucursal: [
        '',
        [Validators.required, Validators.maxLength(300)],
      ],
      estaActivo: [true, [Validators.required]],
      esOficina: [false, [Validators.required]],
      direccion: ['', [Validators.required, Validators.maxLength(300)]],
      telefono: ['', [Validators.required, Validators.maxLength(10)]],
      urlUbicacion: ['', [Validators.required, Validators.maxLength(300)]],
    });
  }

  async CargarListadoSucursales() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Sucursales');
      this.lstSucursales = await this.sucursalesService.obtenerSucursales();
      this.dtOptions = {
        data: this.lstSucursales,
        info: false,
        language: {
          ...this.GetSpanishLanguage(),
        },
        columns: [
          { title: 'Id.', data: 'idSucursal', width: '50px' },
          { title: 'Sucursal', data: 'descripcionSucursal' },
          { title: 'Dirección', data: 'direccion' },
          { title: 'Teléfono', data: 'telefono' },
          { title: 'URL Ubicación', data: 'urlUbicacion', visible: false },
          {
            title: 'Tipo',
            data: 'esOficina',
            width: '150px',
            searchable: false,
            render: function (data: any, type: any, full: any, meta: any) {
              return data ? 'Oficina' : 'Punto de Atención';
            },
            className: 'text-center',
          },
          {
            targets: -1,
            searchable: false,
            render: function (data: any, type: any, full: any, meta: any) {
              return `
              <button type="button" class="btn btn-primary btn-sm" onclick="EditarSucursal(${full.idSucursal})"><i class="fas fa-edit"></i></button>
              <button type="button" class="btn btn-danger btn-sm" onclick="EliminarSucursal(${full.idSucursal})"><i class="fas fa-trash-alt"></i></button>`;
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
      this.dataTable = $(this.tableSucursales.nativeElement);
      this.dataTable.DataTable(this.dtOptions);
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error(
          'Error al obtener las sucursales',
          error.message
        );
      } else {
        this.toastrService.error(
          'Error al obtener las sucursales',
          'Solicitar soporte al departamento de TI.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async EliminarSucursal(idSucursal: number) {
    try {
      const sucursalSeleccionada = this.lstSucursales.find(
        (x) => x.idSucursal == idSucursal
      );
      const result = await Swal.fire({
        title: `¿Estás seguro de eliminar la sucursal ${
          sucursalSeleccionada!.descripcionSucursal
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
          title: 'Eliminando sucursal...',
          text: 'Por favor espere.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          const mensajeEliminacion =
            await this.sucursalesService.eliminarSucursal(idSucursal);
          Swal.fire({
            text: `${mensajeEliminacion}`,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          this.toastrService.error(
            'Error al eliminar el la sucursal del activo',
            'Solicitar soporte al departamento de TI.'
          );
          Swal.close();
        }
      } else {
        this.toastrService.info(
          'Operación cancelada',
          'El usuario cancelo la acción de eliminar la sucursal'
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error(
          'Error al eliminar la sucursal del activo',
          error.message
        );
      } else {
        this.toastrService.error(
          'Error al eliminar la sucursal del activo',
          'Solicitar soporte al departamento de TI.'
        );
      }
    }
  }

  EditarSucursal(idSucursal: number) {
    const sucursalActualizar = this.lstSucursales.find(
      (x) => x.idSucursal == idSucursal
    );
    this.sucursalForm = this.fb.group({
      idSucursal: [sucursalActualizar!.idSucursal, [Validators.required]],
      descripcionSucursal: [
        sucursalActualizar!.descripcionSucursal,
        [Validators.required, Validators.maxLength(300)],
      ],
      estaActivo: [sucursalActualizar!.estaActivo, [Validators.required]],
      esOficina: [sucursalActualizar!.esOficina, [Validators.required]],
      direccion: [
        sucursalActualizar!.direccion,
        [Validators.required, Validators.maxLength(300)],
      ],
      telefono: [
        sucursalActualizar!.telefono,
        [Validators.required, Validators.maxLength(10)],
      ],
      urlUbicacion: [
        sucursalActualizar!.urlUbicacion,
        [Validators.required, Validators.maxLength(300)],
      ],
    });
    this.changeDetector.detectChanges();
    this.btnActualizaSucursal.nativeElement.click();
  }

  SetInactive() {
    this.homeComponent.SetInactive();
  }

  AbrirModal(esEdicion: boolean) {
    this.isEditing = esEdicion;
    if (!esEdicion) {
      this.CrearSucursalForm();
    }
    $('#sucursalModal').modal('show');
  }

  OnSubmit(): void {
    let sucursal = this.sucursalForm.get('descripcionSucursal')?.value;
    let sucursalDireccion = this.sucursalForm.get('direccion')?.value;
    let sucursaltelefono = this.sucursalForm.get('telefono')?.value;
    const coordenadas = this.sucursalForm.get('urlUbicacion')?.value;
    let sucursalUrlUbicacion = '';
    if (!coordenadas.includes('https://www.google.com/maps?q=')) {
      sucursalUrlUbicacion = `https://www.google.com/maps?q=${coordenadas}`;
    } else {
      sucursalUrlUbicacion = coordenadas;
    }
    this.sucursalForm.get('urlUbicacion')?.setValue(sucursalUrlUbicacion);
    if (
      sucursal.trim().length === 0 ||
      sucursalDireccion.trim().length === 0 ||
      sucursaltelefono.trim().length === 0 ||
      coordenadas.trim().length === 0
    ) {
      this.toastrService.error(
        'Error al guardar la sucursal',
        'Los campos por guardar no pueden estar vacíos o contener solo espacios.'
      );
      return;
    }
    if (this.isEditing) {
      this.ActualizarSucursal();
    } else {
      this.CrearSucursal();
    }
  }

  async CrearSucursal() {
    try {
      this.loadingService.showLoading();
      if (this.sucursalForm.valid) {
        try {
          const sucursalData: ISucursalActivo = this.sucursalForm.value;
          sucursalData.descripcionSucursal =
            sucursalData.descripcionSucursal.trim();
          sucursalData.direccion = sucursalData.direccion.trim();
          const mensajeInsercion =
            await this.sucursalesService.insertarSucursal(sucursalData);
          Swal.fire({
            text: mensajeInsercion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error(
              'Error al agregar la sucursal',
              error.message
            );
          } else {
            this.toastrService.error(
              'Error al agregar la sucursal',
              'Solicitar soporte al departamento de TI.'
            );
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.sucursalForm);
        this.toastrService.error(
          'Error al agregar la sucursal',
          'No se llenaron todos los campos necesarios.'
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al agregar la sucursal', error.message);
      } else {
        this.toastrService.error(
          'Error al agregar la sucursal',
          'Solicitar soporte al departamento de TI.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async ActualizarSucursal() {
    try {
      this.loadingService.showLoading();
      if (this.sucursalForm.valid) {
        try {
          const sucursalActualizadoData: ISucursalActivo =
            this.sucursalForm.value;
          const mensajeActualizacion =
            await this.sucursalesService.actualizarSucursal(
              sucursalActualizadoData.idSucursal,
              sucursalActualizadoData
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
              'Error al actualizar la sucursal',
              error.message
            );
          } else {
            this.toastrService.error(
              'Error al actualizar la sucursal',
              'Solicitar soporte al departamento de TI.'
            );
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.sucursalForm);
        this.toastrService.error(
          'Error al actualizar la sucursal',
          'No se llenaron todos los campos necesarios.'
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error(
          'Error al actualizar la sucursal',
          error.message
        );
      } else {
        this.toastrService.error(
          'Error al actualizar la sucursal',
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

  soloNumeros(event: KeyboardEvent): void {
    const key = event.key;
    if (!/^\d+$/.test(key)) {
      event.preventDefault();
    }
  }

  descargarTable() {
    const columnas = [
      { key: 'idSucursal', header: 'ID Sucursal' },
      { key: 'descripcionSucursal', header: 'Nombre de la Sucursal' },
      { key: 'direccion', header: 'Direccion' },
      { key: 'telefono', header: 'Teléfono' },
      { key: 'esOficina', header: 'Oficina' },
    ];
    const sucursales = this.lstSucursales.map((suc) => {
      const row: Record<string, any> = {};
      columnas.forEach((col) => {
        row[col.header] = suc[col.key as keyof ISucursalActivo];
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(sucursales);
    const headers = Object.keys(sucursales[0]);
    ws['!cols'] = headers.map((h) => {
      const max = Math.max(
        h.length,
        ...sucursales.map((r) => (r[h] ? String(r[h]).length : 0))
      );
      return { wch: max + 4 };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sucursales');
    XLSX.writeFile(wb, 'Sucursales.xlsx');
  }
}
