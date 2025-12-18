import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { IProveedorActivo } from 'src/app/models/proveedor-activo';
import { ProveedorActivoService } from 'src/app/services/proveedor-activo.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastrService } from 'src/app/services/toastr.service';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import { HomeComponent } from '../home.component';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICanton, IProvincia } from 'src/app/models/provincia-canton-activo';
declare var $: any;

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css'],
})
export class ProveedoresComponent implements OnInit {
  @ViewChild('dataTableProveedores', { static: false })
  tableProveedores!: ElementRef;
  @ViewChild('btnActualizaProveedor', { static: true })
  btnActualizaProveedor!: ElementRef;

  isEditing: boolean = false;
  lstProveedores: IProveedorActivo[] = [];
  lstProvincias: IProvincia[] = [];
  lstProvinciasFiltrados: IProvincia[] = [];
  lstCantones: ICanton[] = [];
  lstCantonesFiltrados: ICanton[] = [];
  provinciaControl: FormControl = new FormControl('', Validators.required);
  cantonControl: FormControl = new FormControl('', Validators.required);
  visualizarProvincia = false;
  visualizarCanton = false;
  dtOptions: any;
  dataTable: any;
  proveedorForm!: FormGroup;

  constructor(
    private loadingService: LoadingService,
    private appComponent: AppComponent,
    private homeComponent: HomeComponent,
    private proveedoresService: ProveedorActivoService,
    private fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    (window as any).EliminarProveedor = this.EliminarProveedor.bind(this);
    (window as any).EditarProveedor = this.EditarProveedor.bind(this);
    this.CargarListadoProveedores();
    this.CargarInformacion();
    this.CrearProveedorForm();
    const body = this.el.nativeElement.ownerDocument.body;
    this.renderer.setStyle(body, 'overflow', '');
  }

  async CargarInformacion() {
    let response = await this.proveedoresService.obtenerProvinciasCantones();
    this.lstCantones = response?.cantones as ICanton[];
    this.lstProvinciasFiltrados = this.lstProvincias = response?.provincias as IProvincia[];
  }

  CrearProveedorForm() {
    this.provinciaControl = new FormControl('', Validators.required);
    this.cantonControl = new FormControl('', Validators.required);
    this.proveedorForm = this.fb.group({
      rucProveedor: ['', [Validators.required]],
      razonSocial: ['', [Validators.required, Validators.maxLength(255)]],
      direccionProveedor: ['', [Validators.required, Validators.maxLength(255)],],
      telefonoProveedor: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(10)]],
      estaActivo: [true, [Validators.required]],
      idProvincia: ['', [Validators.required]],
      idCanton: ['', [Validators.required]],
    });
  }

  async CargarListadoProveedores() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Proveedores');
      this.lstProveedores = await this.proveedoresService.obtenerProveedores();
      this.dtOptions = {
        data: this.lstProveedores,
        info: false,
        language: {
          ...this.GetSpanishLanguage(),
        },
        columns: [
          { title: 'RUC', data: 'rucProveedor', width: '50px' },
          { title: 'Razon Social', data: 'razonSocial' },
          { title: 'Dirección', data: 'direccionProveedor' },
          { title: 'Teléfono', data: 'telefonoProveedor' },
          {
            title: 'Provincia', data: 'idProvincia', render: (data: any, type: any, row: any) => {
              return row.provincia?.nombre || data;
            },
          },
          {
            title: 'Cantón', data: 'idCanton', render: (data: any, type: any, row: any) => {
              return row.canton?.nombrE_CANTON || data;
            },
          },
          {
            targets: -1,
            searchable: false,
            render: function (data: any, type: any, full: any, meta: any) {
              return `
              <button type="button" class="btn btn-primary btn-sm" onclick="EditarProveedor(${full.rucProveedor})"><i class="fas fa-edit"></i></button>
              <button type="button" class="btn btn-danger btn-sm" onclick="EliminarProveedor(${full.rucProveedor})"><i class="fas fa-trash-alt"></i></button>`;
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
      this.dataTable = $(this.tableProveedores.nativeElement);
      this.dataTable.DataTable(this.dtOptions);
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener los proveedores', error.message);
      } else {
        this.toastrService.error('Error al obtener los proveedores', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async EliminarProveedor(rucProveedor: string) {
    try {
      const proveedorSeleccionado = this.lstProveedores.find((x) => x.rucProveedor == rucProveedor);
      const result = await Swal.fire({
        title: `¿Estás seguro de eliminar el proveedor?`,
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
          title: 'Eliminando proveedor...',
          text: 'Por favor espere.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          const mensajeEliminacion = await this.proveedoresService.eliminarProveedor(rucProveedor);
          Swal.fire({
            text: `${mensajeEliminacion}`,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          this.toastrService.error('Error al eliminar el el proveedor', 'Solicitar soporte al departamento de TI.');
          Swal.close();
        }
      } else {
        this.toastrService.info('Operación cancelada', 'El usuario cancelo la acción de eliminar el proveedor');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al eliminar el proveedor', error.message);
      } else {
        this.toastrService.error('Error al eliminar el proveedor', 'Solicitar soporte al departamento de TI.');
      }
    }
  }

  EditarProveedor(rucProveedor: string) {
    const proveedorActualizar = this.lstProveedores.find(
      (x) => x.rucProveedor == rucProveedor
    );
    this.proveedorForm = this.fb.group({
      rucProveedor: [proveedorActualizar!.rucProveedor, [Validators.required]],
      razonSocial: [proveedorActualizar!.razonSocial,
      [Validators.required, Validators.maxLength(255)],],
      direccionProveedor: [proveedorActualizar!.direccionProveedor,
      [Validators.required, Validators.maxLength(255)],],
      telefonoProveedor: [proveedorActualizar!.telefonoProveedor,
      [Validators.required, Validators.minLength(9), Validators.maxLength(10)],],
      idProvincia: [proveedorActualizar!.idProvincia, [Validators.required]],
      idCanton: [proveedorActualizar!.idCanton, [Validators.required]],
      estaActivo: [proveedorActualizar!.estaActivo, [Validators.required]],
    });

    let informacionProvincia = this.lstProvincias.find((x) => x.id == proveedorActualizar?.idProvincia);
    let informacionCanton = this.lstCantones.find((x) => x.ID_CANTON == proveedorActualizar?.idCanton);
    this.SelectProvincia(informacionProvincia!);
    this.SelectCantones(informacionCanton!);
    this.proveedorForm.get('rucProveedor')?.disable();
    this.changeDetector.detectChanges();
    this.btnActualizaProveedor.nativeElement.click();
  }

  SetInactive() {
    this.homeComponent.SetInactive();
  }
  AbrirModal(esEdicion: boolean) {
    this.lstCantonesFiltrados = [];
    this.isEditing = esEdicion;
    if (!esEdicion) {
      this.CrearProveedorForm();
    }
    $('#proveedorModal').modal('show');
  }

  OnSubmit(): void {
    const direccion = this.proveedorForm.get('direccionProveedor')?.value.trim();
    const razon = this.proveedorForm.get('razonSocial')?.value.trim();
    if (!direccion || direccion.length < 1) {
      this.appComponent.validateAllFormFields(this.proveedorForm);
      this.toastrService.error('Error en la direccion', 'No puede estar vacía o contener solo espacios.');
      return;
    }
    if (!razon || razon.length < 1) {
      this.appComponent.validateAllFormFields(this.proveedorForm);
      this.toastrService.error('Error en la razon social', 'No puede estar vacía o contener solo espacios.');
      return;
    }
    const razonProveedor = this.proveedorForm.get('razonSocial');
    if (razonProveedor?.hasError('maxlength')) {
      this.toastrService.error('Error en la razón social', 'La longitud máxima es 255.');
      return;
    }
    if (this.proveedorForm.invalid) {
      this.appComponent.validateAllFormFields(this.proveedorForm);
      const telefono = this.proveedorForm.get('telefonoProveedor');
      if (telefono?.hasError('minlength')) {
        this.toastrService.error('Error en el teléfono', 'Debe tener un mínimo de 9 dígitos.');
        return;
      }
      this.toastrService.error('Error al agregar el proveedor', 'No se llenaron todos los campos necesarios.');
    }
    if (this.isEditing) {
      this.ActualizarProveedor();
    } else {
      this.CrearProveedor();
    }
  }

  async CrearProveedor() {
    try {
      this.loadingService.showLoading();
      if (this.proveedorForm.valid) {
        try {
          const proveedorData: IProveedorActivo = this.proveedorForm.value;
          proveedorData.razonSocial = proveedorData.razonSocial.toUpperCase();
          proveedorData.direccionProveedor = proveedorData.direccionProveedor.toUpperCase();
          const mensajeInsercion = await this.proveedoresService.insertarProveedor(proveedorData);
          Swal.fire({
            text: mensajeInsercion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al agregar el proveedor', error.message);
          } else {
            this.toastrService.error('Error al agregar el proveedor', 'Solicitar soporte al departamento de TI.');
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al agregar el proveedor', error.message);
      } else {
        this.toastrService.error('Error al agregar el proveedor', 'Solicitar soporte al departamento de TI.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async ActualizarProveedor() {
    try {
      this.loadingService.showLoading();
      if (this.provinciaControl.value == '') {
        this.proveedorForm.patchValue({ idProvincia: '' });
      }
      if (this.cantonControl.value == '') {
        this.proveedorForm.patchValue({ idCanton: '' });
      }
      if (this.proveedorForm.valid) {
        try {
          const proveedorActualizadoData: IProveedorActivo = this.proveedorForm.getRawValue();
          proveedorActualizadoData.direccionProveedor = proveedorActualizadoData.direccionProveedor.toUpperCase();
          proveedorActualizadoData.razonSocial = proveedorActualizadoData.razonSocial.toUpperCase();
          const mensajeActualizacion = await this.proveedoresService.actualizarProveedor(proveedorActualizadoData.rucProveedor, proveedorActualizadoData);
          Swal.fire({
            text: mensajeActualizacion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al actualizar el proveedor', error.message);
          } else {
            this.toastrService.error('Error al actualizar el proveedor', 'Solicitar soporte al departamento de TI.');
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al actualizar el proveedor', error.message);
      } else {
        this.toastrService.error('Error al actualizar el proveedor', 'Solicitar soporte al departamento de TI.');
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

  FilterProvincias(): void {
    const filterValue = this.provinciaControl.value?.toLowerCase();
    this.lstProvinciasFiltrados = this.lstProvincias
      .filter((provincia) => provincia.nombre.toLowerCase().includes(filterValue!))
      .slice(0, 4);
  }

  SelectProvincia(provincia: IProvincia): void {
    this.lstCantonesFiltrados = this.lstCantones as ICanton[];
    this.provinciaControl.setValue(provincia.nombre);
    this.proveedorForm.get('idProvincia')?.setValue(provincia.id);
    this.cantonControl.setValue('');
    this.proveedorForm.get('idCanton')?.setValue('');
    this.visualizarProvincia = false;
  }

  HideProvincia(): void {
    setTimeout(() => (this.visualizarProvincia = false), 200);
  }

  FilterCantones(): void {
    const filterValue = this.cantonControl.value?.toLowerCase();
    this.lstCantonesFiltrados = this.lstCantones
      .filter((canton) => canton.NOMBRE_CANTON.toLowerCase().includes(filterValue!))
      .slice(0, 4);
  }

  SelectCantones(canton: ICanton): void {
    this.cantonControl.setValue(canton.NOMBRE_CANTON);
    this.proveedorForm.get('idCanton')?.setValue(canton.ID_CANTON);
    this.visualizarCanton = false;
  }

  HideCantones(): void {
    setTimeout(() => (this.visualizarCanton = false), 200);
  }

  onProvinciaChange(idProvincia: number) {
    this.lstCantonesFiltrados = this.lstCantones.filter((c) => c.ID_PROVINCIA === idProvincia);
  }

  enRucInput() {
    this.proveedorForm.get('razonSocial')?.setValue('');
  }
  async onConsultarRuc() {
    const ruc = this.proveedorForm.get('rucProveedor')?.value;
    if (!ruc) {
      this.toastrService.error('Error en el RUC', 'No se puede consultar un Ruc vacío');
      return;
    }
    if (ruc.length !== 13) {
      this.toastrService.error('Error en el RUC', 'El Ruc ingresado no es valido');
      return;
    }
    // Validación de RUC que finalice en 001
    if (!ruc.endsWith('001')) {
      this.toastrService.error('Error en el RUC', 'El Ruc debe finalizar en 001');
      return;
    }
    this.loadingService.showLoading();
    try {
      const informacionRuc = await this.proveedoresService.obtenerInformacionRuc(ruc);
      let campos: string[] = informacionRuc.split('\n') as string[];
      if (!informacionRuc || campos.length == 0) {
        this.toastrService.warning('Consulta RUC', 'No se pudo obtener información.');
        this.loadingService.showLoading();
      }
      let razonSocial = campos.find((x: string) => x.toUpperCase().includes('RAZONSOCIAL'));
      this.proveedorForm.patchValue({ razonSocial: razonSocial?.split(':')[1]?.trim(), });
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al realizar la consulta del RUC', error.message);
      } else {
        this.toastrService.error('Error al realizar la consulta del RUC', 'Solicitar soporte al departamento de TI.');
      }
      this.proveedorForm.get('razonSocial')?.setValue('');
    } finally {
      this.loadingService.hideLoading();
    }
  }

  getProvinciaNombre(idProvincia: number) {
    return this.lstProvincias.find(p => p.id === idProvincia)?.nombre || '';
  }

  getCantonNombre(idCanton: string) {
    return this.lstCantones.find(c => c.ID_CANTON === idCanton)?.NOMBRE_CANTON || '';
  }

  descargarTable() {
    const columnas = [
      { key: 'rucProveedor', header: 'RUC' },
      { key: 'razonSocial', header: 'Razón Social' },
      { key: 'direccionProveedor', header: 'Dirección' },
      { key: 'telefonoProveedor', header: 'Teléfono' },
      { key: 'idProvincia', header: 'Provincia', transform: (id: any) => this.getProvinciaNombre(id) },
      { key: 'idCanton', header: 'Cantón', transform: (id: any) => this.getCantonNombre(id) },
    ];

    const tabla = this.lstProveedores.map((pro) => {
      const row: Record<string, any> = {};
      columnas.forEach((col) => {
        const valor = pro[col.key as keyof IProveedorActivo];
        // Aplicar transformación si existe
        if (col.transform && valor !== undefined && valor !== null) {
          row[col.header] = col.transform(valor);
        } else {
          row[col.header] = valor !== undefined ? valor : '';
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(tabla);
    const headers = Object.keys(tabla[0]);
    ws['!cols'] = headers.map((h) => {
      const max = Math.max(h.length, ...tabla.map((r) => (r[h] ? String(r[h]).length : 0)));
      return { wch: max + 2 };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
    XLSX.writeFile(wb, 'Proveedores.xlsx');
  }
}
