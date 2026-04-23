import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { IDocumentoEmpleado, IEmpleadoActivo, IInformacionEmpleado } from 'src/app/models/empleado-activo';
import { LoadingService } from 'src/app/services/loading.service';
import { EmpleadoActivoService } from 'src/app/services/empleado-activo.service';
import { ToastrService } from 'src/app/services/toastr.service';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import { HomeComponent } from '../home.component';
import Swal from 'sweetalert2';
import { ICargoActivo } from 'src/app/models/cargo-activo';
import { CargoActivoService } from 'src/app/services/cargo-activo.service';
import { IDepartamentoActivo } from 'src/app/models/departamento-activo';
import { DepartamentoActivoService } from 'src/app/services/departamento-activo.service';
import { ISucursalActivo } from 'src/app/models/sucursal-activo';
import { SucursalActivoService } from 'src/app/services/sucursal-activo.service';
import { IProductoActivo, IProductoEmpleadoActivo, IProductoEmpleadoResponse } from 'src/app/models/producto-activo';
import { ProductoActivoService } from 'src/app/services/producto-activo.service';
import { IModeloActivo } from 'src/app/models/modelo-activo';
import { ModeloActivoService } from 'src/app/services/modelo-activo.service';
import { MarcaActivoService } from 'src/app/services/marca-activo.service';
import { IMarcaActivo } from 'src/app/models/marca-activo';
import * as XLSX from 'xlsx';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ITipoActaActivo } from 'src/app/models/tipo-acta-activo';
import { TipoActaActivoService } from 'src/app/services/tipo-acta-activo.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { merge, Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'],
})
export class EmpleadosComponent implements OnInit {
  @ViewChild('dataTableEmpleados', { static: false })
  tableEmpleados!: ElementRef;
  @ViewChild('btnActualizaEmpleado', { static: true })
  btnActualizaEmpleado!: ElementRef;
  @ViewChild('cedulaInput') cedulaInput!: ElementRef;

  isEditing: boolean = false;
  lstEmpleados: IEmpleadoActivo[] = [];
  lstCargos: ICargoActivo[] = [];
  lstCargosFiltrados: ICargoActivo[] = [];
  lstDepartamentos: IDepartamentoActivo[] = [];
  lstDepartamentosFiltrados: IDepartamentoActivo[] = [];
  lstSucursales: ISucursalActivo[] = [];
  lstSucursalesFiltrados: ISucursalActivo[] = [];
  lstProductos: IProductoActivo[] = [];
  lstProductosFiltrados: IProductoActivo[] = [];
  lstModelos: IModeloActivo[] = [];
  lstModelosFiltrados: IModeloActivo[] = [];
  lstMarcas: IMarcaActivo[] = [];
  lstMarcasFiltradas: IMarcaActivo[] = [];
  lstProductosEmpleado: IProductoEmpleadoActivo[] = [];
  lstProductosAsignados: IProductoEmpleadoResponse[] = [];
  lstRolesUsuario: string[] = [];
  lstEmpleadoEntregaFiltrado: IEmpleadoActivo[] = [];
  lstEmpleadoRecibeFiltrado: IEmpleadoActivo[] = [];
  lstTipoActas: ITipoActaActivo[] = [];
  lstTipoActaFiltradas: ITipoActaActivo[] = [];
  dtOptions: any;
  dataTable: any;
  empleadoForm!: FormGroup;
  productoEmpleadoForm!: FormGroup;
  cargoControl: FormControl = new FormControl('', Validators.required);
  departamentoControl: FormControl = new FormControl('', Validators.required);
  sucursalControl: FormControl = new FormControl('', Validators.required);
  productoControl: FormControl = new FormControl('', Validators.required);
  modeloControl: FormControl = new FormControl('', Validators.required);
  marcaControl: FormControl = new FormControl('', Validators.required);
  empleadoEntregaControl: FormControl = new FormControl('', Validators.required);
  empleadoRecibeControl: FormControl = new FormControl('', Validators.required);
  tipoActaControl: FormControl = new FormControl('', Validators.required);
  visualizarCargos = false;
  visualizarDepartamentos = false;
  visualizarSucursales = false;
  visualizarProductos = false;
  visualizarModelos = false;
  visualizarMarcas = false;
  visualizarEmpleadosEntrega = false;
  visualizarEmpleadosRecibe = false;
  visualizarTiposActa = false;
  previewUrl: string | ArrayBuffer | null = null;
  imagenEmpleado: File | null = null;
  private subs = new Subscription();
  emailCorpAuto = true;
  fotoRequeridaError = false;
  lstDocumentosEmpleado: IDocumentoEmpleado[] = [];
  zipUrl: string | null = null;
  zipNombre: string | null = null;
  empleadoSeleccionado: string | null = null;

  constructor(
    private loadingService: LoadingService,
    public appComponent: AppComponent,
    private homeComponent: HomeComponent,
    private empleadosService: EmpleadoActivoService,
    private cargosService: CargoActivoService,
    private departamentosService: DepartamentoActivoService,
    private sucursalesService: SucursalActivoService,
    private productosService: ProductoActivoService,
    private modelosService: ModeloActivoService,
    private marcasService: MarcaActivoService,
    private tiposActaService: TipoActaActivoService,
    private fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2,
    private toastrService: ToastrService,
    private usuarioService: UsuarioService,
  ) { }

  ngOnInit(): void {
    (window as any).EliminarEmpleado = this.EliminarEmpleado.bind(this);
    (window as any).EditarEmpleado = this.EditarEmpleado.bind(this);
    (window as any).AsignarProductoModal = this.AsignarProductoModal.bind(this);
    (window as any).VerDocumentosEmpleado = this.VerDocumentosEmpleado.bind(this);
    this.CargarListadoEmpleados();
    this.CrearEmpleadoForm();
    this.AsignarProductoForm({} as IEmpleadoActivo);
    const body = this.el.nativeElement.ownerDocument.body;
    this.renderer.setStyle(body, 'overflow', '');
    var rolesString = localStorage.getItem("roles") ?? "";
    this.lstRolesUsuario = rolesString.split(',') ?? [];
  }

  CrearEmpleadoForm() {

    this.cargoControl = new FormControl('', Validators.required);
    this.departamentoControl = new FormControl('', Validators.required);
    this.sucursalControl = new FormControl('', Validators.required);

    this.empleadoForm = this.fb.group({
      // Personal
      cedulaEmpleado: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      nombreEmpleado: ['', Validators.required],
      apellidoEmpleado: ['', Validators.required],
      telefonoEmpleado: ['', [Validators.required, Validators.minLength(9)]],
      emailEmpleado: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', Validators.required],
      direccionEmpleado: ['', [Validators.required]],
      // Foto
      fotoUrl: [''],
      // Corporativo
      numeroCuenta: ['', [Validators.required, Validators.minLength(5)]],
      sueldoEmpleado: [null, [Validators.required, Validators.min(0.01)]],
      numeroCorporativo: [''],
      emailCorporativo: ['', [Validators.required, Validators.email]],
      fechaIngreso: ['', Validators.required],
      // Organizacional
      idSucursal: [null, Validators.required],
      idDepartamento: [null, Validators.required],
      idCargo: [null, Validators.required],
    });
    this.empleadoForm.get('fechaIngreso')?.setValue(new Date().toISOString().slice(0, 10));
  }


  generarCorreoCorporativo() {
    const nombreRaw = (this.empleadoForm.get('nombreEmpleado')?.value ?? '').toString();
    const apellidoRaw = (this.empleadoForm.get('apellidoEmpleado')?.value ?? '').toString();
    const emailCtrl = this.empleadoForm.get('emailCorporativo');

    if (!emailCtrl) return;

    const nombre = this.limpiarTexto(nombreRaw);
    const apellido = this.limpiarTexto(apellidoRaw);

    if (!nombre || !apellido) {
      emailCtrl.setValue('', { emitEvent: false });
      return;
    }

    const primerNombre = nombre.split(' ').filter(Boolean)[0] ?? '';
    const primerApellido = apellido.split(' ').filter(Boolean)[0] ?? '';

    if (!primerNombre || !primerApellido) return;

    const dominio = '@segurossuarez.com';

    // 1) intento con 1 letra
    let base = `${primerNombre.slice(0, 1)}${primerApellido}`;
    let candidato = `${base}${dominio}`.toLowerCase();

    // Si existe, 2) intento con 2 letras
    if (this.emailExiste(candidato)) {
      base = `${primerNombre.slice(0, 2)}${primerApellido}`;
      candidato = `${base}${dominio}`.toLowerCase();
    }

    // Si aún existe, 3) agrega número incremental
    if (this.emailExiste(candidato)) {
      let i = 2;
      while (this.emailExiste(`${base}${i}${dominio}`)) {
        i++;
      }
      candidato = `${base}${i}${dominio}`.toLowerCase();
    }

    emailCtrl.setValue(candidato, { emitEvent: false });
  }

  private emailExiste(email: string): boolean {
    const e = (email ?? '').toLowerCase().trim();
    return (this.lstEmpleados ?? []).some(emp =>
      (emp.emailEmpleado ?? '').toLowerCase().trim() === e
    );
  }

  private limpiarTexto(texto: string): string {
    return (texto ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zñ\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  async CargarListadoEmpleados() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Empleados');
      this.lstEmpleados = await this.empleadosService.obtenerEmpleados();
      this.lstCargos = await this.cargosService.obtenerCargos();
      this.lstDepartamentos = await this.departamentosService.obtenerDepartamentos();
      this.lstSucursales = await this.sucursalesService.obtenerSucursales();
      this.lstSucursales = this.lstSucursales.sort((a, b) => a.descripcionSucursal.localeCompare(b.descripcionSucursal));
      if (this.lstCargos.length > 0) {
        this.lstCargosFiltrados = this.lstCargos;
      }
      if (this.lstDepartamentos.length > 0) {
        this.lstDepartamentosFiltrados = this.lstDepartamentos;
      }
      if (this.lstSucursales.length > 0) {
        this.lstSucursalesFiltrados = this.lstSucursales;
      }
      if (this.lstEmpleados.length > 0) {
        this.lstEmpleadoEntregaFiltrado = [...this.lstEmpleados];
        this.lstEmpleadoRecibeFiltrado = [...this.lstEmpleados];
      }

      this.dtOptions = {
        data: this.lstEmpleados,
        info: false,
        language: {
          ...this.GetSpanishLanguage(),
        },
        columns: [
          { title: 'Sucursal', data: 'descripcionSucursal' },
          { title: 'Departamento', data: 'nombreDepartamento' },
          { title: 'Cargo', data: 'nombreCargo' },
          {
            title: 'Cédula',
            data: 'cedulaEmpleado',
            width: '50px',
          },
          {
            targets: 4,
            title: 'Empleado',
            render: function (data: any, type: any, full: any, meta: any) {
              return `${full.nombreEmpleado} ${full.apellidoEmpleado}`;
            },
          },
          { title: 'Teléfono', data: 'telefonoEmpleado' },
          { title: 'Email', data: 'emailEmpleado' },
          {
            targets: -1,
            orderable: false,
            searchable: false,
            render: (data: any, type: any, full: any, meta: any) => {
              const esRH = this.VerificarRolUsuario(['RH']);
              const botonEditar = esRH ? `<button class="btn btn-sm btn-primary" onclick="EditarEmpleado('${full.cedulaEmpleado}')"><i class="fas fa-edit"></i></button>` : '';
              const botonEliminar = esRH ? `<button class="btn btn-sm btn-danger" onclick="EliminarEmpleado('${full.cedulaEmpleado}')"><i class="fas fa-trash-alt"></i></button>` : '';
              const botonAsignar = `<button class="btn btn-sm btn-secondary" onclick="AsignarProductoModal('${full.cedulaEmpleado}')"><i class="fas fa-clipboard-list"></i></button>`;
              const botonDocs = `<button class="btn btn-sm btn-info btn-docs" onclick="VerDocumentosEmpleado('${full.cedulaEmpleado}')"><i class="fas fa-file-alt"></i></button>`;
              return `${botonEditar} ${botonEliminar} ${botonDocs}`;
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
      this.dataTable = $(this.tableEmpleados.nativeElement);
      this.dataTable.DataTable(this.dtOptions);
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener los empleados', error.message);
      } else {
        this.toastrService.error('Error al obtener los empleados', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async EliminarEmpleado(cedulaEmpleado: string) {
    try {
      const empleadoSeleccionado = this.lstEmpleados.find((x) => x.cedulaEmpleado === cedulaEmpleado);
      const result = await Swal.fire({
        title: `¿Estás seguro de eliminar el empleado ${empleadoSeleccionado!.nombreEmpleado}?`,
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
          title: 'Eliminando empleado...',
          text: 'Por favor espere.',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); },
        });
        try {
          const mensajeEliminacion = await this.empleadosService.eliminarEmpleado(cedulaEmpleado);
          Swal.fire({ text: `${mensajeEliminacion}`, icon: 'success' }).then(() => { window.location.reload(); });
        } catch (error) {
          this.toastrService.error('Error al eliminar empleado', 'Solicitar soporte al departamento de TI.');
          Swal.close();
        }
      } else {
        this.toastrService.info('Operación cancelada', 'El usuario cancelo la acción de eliminar el empleado');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al eliminar el empleado', error.message);
      } else {
        this.toastrService.error('Error al eliminar el empleado', 'Solicitar soporte al departamento de TI.');
      }
    }
  }

  EditarEmpleado(cedulaEmpleado: string) {
    const empleadoActualizar = this.lstEmpleados.find((x) => x.cedulaEmpleado == cedulaEmpleado);
    this.empleadoForm.patchValue({
      cedulaEmpleado: empleadoActualizar?.cedulaEmpleado ?? '',
      nombreEmpleado: empleadoActualizar?.nombreEmpleado ?? '',
      apellidoEmpleado: empleadoActualizar?.apellidoEmpleado ?? '',
      telefonoEmpleado: empleadoActualizar?.telefonoEmpleado ?? '',
      emailEmpleado: empleadoActualizar?.emailEmpleado ?? '',
      fechaNacimiento: empleadoActualizar?.fechaNacimiento ? new Date(empleadoActualizar.fechaNacimiento).toISOString().slice(0, 10) : '',
      fechaIngreso: empleadoActualizar?.fechaIngreso ? new Date(empleadoActualizar.fechaIngreso).toISOString().slice(0, 10) : '',
      numeroCuenta: empleadoActualizar?.numeroCuenta ?? '',
      sueldoEmpleado: empleadoActualizar?.sueldoEmpleado ?? null,
      numeroCorporativo: empleadoActualizar?.numeroCorporativo ?? '',
      emailCorporativo: empleadoActualizar?.emailCorporativo ?? '',
      fotoUrl: empleadoActualizar?.fotoUrl ?? '',
      fotoEmpleado: empleadoActualizar?.fotoEmpleado ?? '',
      direccionEmpleado: empleadoActualizar?.direccionEmpleado ?? '',
    });
    let informacionCargo = this.lstCargos.find((x) => x.idCargo == empleadoActualizar?.idCargo);
    let informacionDepartamento = this.lstDepartamentos.find((x) => x.idDepartamento == empleadoActualizar?.idDepartamento);
    let informacionSucursal = this.lstSucursales.find((x) => x.idSucursal == empleadoActualizar?.idSucursal);
    this.SelectCargo(informacionCargo!);
    this.SelectDepartamento(informacionDepartamento!);
    this.SelectSucursal(informacionSucursal!);
    this.empleadoForm.get('cedulaEmpleado')?.disable();
    this.isEditing = true;
    this.changeDetector.detectChanges();
    this.btnActualizaEmpleado.nativeElement.click();
  }

  SetInactive() {
    this.homeComponent.SetInactive();
  }

  AbrirModal(esEdicion: boolean) {
    this.isEditing = esEdicion;
    this.previewUrl = null;
    if (!esEdicion) {
      this.CrearEmpleadoForm();
    }
    $('#empleadoModal').modal('show');
  }

  OnSubmit(): void {
    console.log(this.isEditing);
    if (this.isEditing) {
      this.ActualizarEmpleado();
    } else {
      this.CrearEmpleado();
    }
  }

  async CrearEmpleado() {
    try {
      this.loadingService.showLoading();

      this.empleadoForm.markAllAsTouched();
      this.empleadoForm.updateValueAndValidity();
      this.fotoRequeridaError = !this.imagenEmpleado;

      if (this.empleadoForm.invalid || this.fotoRequeridaError) {
        this.toastrService.error('Error', 'Faltan campos obligatorios por completar.');
        return;
      }

      const empleadoData = this.empleadoForm.getRawValue();
      empleadoData.nombreEmpleado = (empleadoData.nombreEmpleado ?? '').trim();
      empleadoData.apellidoEmpleado = (empleadoData.apellidoEmpleado ?? '').trim();
      empleadoData.cedulaEmpleado = (empleadoData.cedulaEmpleado ?? '').trim();
      empleadoData.emailEmpleado = (empleadoData.emailEmpleado ?? '').trim();
      empleadoData.telefonoEmpleado = (empleadoData.telefonoEmpleado ?? '').trim();
      empleadoData.emailCorporativo = (empleadoData.emailCorporativo ?? '').trim();
      empleadoData.fotoEmpleado = (this.imagenEmpleado?.name ?? '').trim();

      const formData = new FormData();
      Object.keys(empleadoData).forEach((key) => {
        const value = empleadoData[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      formData.append('ImagenEmpleado', this.imagenEmpleado as File);

      const mensaje = await this.empleadosService.insertarEmpleado(formData);

      Swal.fire({
        icon: 'success',
        title: 'OK',
        text: mensaje,
        timer: 2000,
        showConfirmButton: false
      }).then(() => { window.location.reload(); });

    } catch (error: any) {
      this.toastrService.error('Error al agregar el empleado', error?.message ?? 'Solicitar soporte a TI.');
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async ActualizarEmpleado() {
    try {
      this.loadingService.showLoading();

      // 1) Marcar para que se vean errores
      this.empleadoForm.markAllAsTouched();
      this.empleadoForm.updateValueAndValidity();

      // 2) Validaciones simples para selects/autocomplete (si están vacíos, el id debe quedar null)
      if (!this.cargoControl.value) this.empleadoForm.get('idCargo')?.setValue(null);
      if (!this.departamentoControl.value) this.empleadoForm.get('idDepartamento')?.setValue(null);
      if (!this.sucursalControl.value) this.empleadoForm.get('idSucursal')?.setValue(null);

      // 3) Si el form está inválido, salir
      if (this.empleadoForm.invalid) {
        this.toastrService.error('Error', 'Faltan campos obligatorios por completar.');
        return;
      }

      // 4) Preparar data
      const empleadoActualizadoData: IEmpleadoActivo = this.empleadoForm.getRawValue();

      // trims (recomendado)
      empleadoActualizadoData.nombreEmpleado = (empleadoActualizadoData.nombreEmpleado ?? '').trim();
      empleadoActualizadoData.apellidoEmpleado = (empleadoActualizadoData.apellidoEmpleado ?? '').trim();
      empleadoActualizadoData.emailEmpleado = (empleadoActualizadoData.emailEmpleado ?? '').trim();
      empleadoActualizadoData.telefonoEmpleado = (empleadoActualizadoData.telefonoEmpleado ?? '').trim();
      empleadoActualizadoData.emailCorporativo = (empleadoActualizadoData.emailCorporativo ?? '').trim();

      // si quieres guardar el nombre de la imagen en el form
      empleadoActualizadoData.fotoEmpleado = (this.imagenEmpleado?.name ?? empleadoActualizadoData.fotoEmpleado ?? '').trim();

      // 5) FormData
      const formData = new FormData();
      Object.keys(empleadoActualizadoData).forEach((key) => {
        const value = (empleadoActualizadoData as any)[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // 6) Solo adjunta imagen si se cambió
      if (this.imagenEmpleado) {
        formData.append('ImagenEmpleado', this.imagenEmpleado);
      }

      // 7) Actualizar
      const mensajeActualizacion = await this.empleadosService.actualizarEmpleado(
        empleadoActualizadoData.cedulaEmpleado,
        formData
      );

      Swal.fire({
        icon: 'success',
        title: 'OK',
        text: mensajeActualizacion,
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        window.location.reload();
      });

    } catch (error: any) {
      this.toastrService.error('Error al actualizar el empleado', error?.message ?? 'Solicitar soporte a TI.');
    } finally {
      this.loadingService.hideLoading();
    }
  }

  FilterCargos(): void {
    const filterValue = this.cargoControl.value.toLowerCase();
    this.lstCargosFiltrados = this.lstCargos.filter((cargo) => cargo.nombreCargo.toLowerCase().includes(filterValue)).slice(0, 4);
  }

  FilterDepartamentos(): void {
    const filterValue = this.departamentoControl.value.toLowerCase();
    this.lstDepartamentosFiltrados = this.lstDepartamentos.filter((departamento) => departamento.nombreDepartamento.toLowerCase().includes(filterValue)).slice(0, 4);
  }

  FilterSucursales(): void {
    const filterValue = this.sucursalControl.value.toLowerCase();
    this.lstSucursalesFiltrados = this.lstSucursales.filter((sucursal) => sucursal.descripcionSucursal.toLowerCase().includes(filterValue)).slice(0, 4);
  }

  FilterProductos(): void {
    const filterValue = this.productoControl.value!.toLowerCase();
    this.lstProductosFiltrados = this.lstProductos.filter(producto => producto.nombreProducto.toLowerCase().includes(filterValue) || producto.codigoProducto.includes(filterValue));
  }

  FilterModelos(): void {
    const filterValue = this.modeloControl.value.toLowerCase();
    this.lstModelosFiltrados = this.lstModelos.filter((modelo) => modelo.nombreModelo.toLowerCase().includes(filterValue)).slice(0, 4);
  }

  FilterMarcas(): void {
    const filterValue = this.marcaControl.value!.toLowerCase();
    this.lstMarcasFiltradas = this.lstMarcas.filter(marca => marca.nombreMarca.toLowerCase().includes(filterValue));
  }

  FilterEmpleados(campo: 'entrega' | 'recibe'): void {
    const controlEmpleado = campo === 'entrega' ? this.empleadoEntregaControl : this.empleadoRecibeControl;
    const filterValue = controlEmpleado.value?.toLowerCase() || '';
    const resultados = this.lstEmpleados.filter(empleado => empleado.nombreEmpleado.toLowerCase().includes(filterValue) || empleado.apellidoEmpleado.toLowerCase().includes(filterValue)).slice(0, 4);
    if (campo === 'entrega') {
      this.lstEmpleadoEntregaFiltrado = resultados;
      this.visualizarEmpleadosEntrega = true;
    } else {
      this.lstEmpleadoRecibeFiltrado = resultados;
      this.visualizarEmpleadosRecibe = true;
    }
  }

  FilterTipoActas(): void {
    const filterValue = this.tipoActaControl.value!.toLowerCase();
    this.lstTipoActaFiltradas = this.lstTipoActas.filter(tipoActa => tipoActa.nombreTipoActa.toLowerCase().includes(filterValue));
  }

  SelectCargo(cargo: ICargoActivo): void {
    this.cargoControl.setValue(cargo.nombreCargo, { emitEvent: false });

    const ctrl = this.empleadoForm.get('idCargo');
    ctrl?.setValue(cargo.idCargo);
    ctrl?.markAsTouched();
    ctrl?.markAsDirty();
    ctrl?.setErrors(null); // quita "required" si ya seleccionó

    this.visualizarCargos = false;
  }

  SelectDepartamento(departamento: IDepartamentoActivo): void {
    this.departamentoControl.setValue(departamento.nombreDepartamento, { emitEvent: false });

    const ctrl = this.empleadoForm.get('idDepartamento');
    ctrl?.setValue(departamento.idDepartamento);
    ctrl?.markAsTouched();
    ctrl?.markAsDirty();
    ctrl?.setErrors(null);

    this.visualizarDepartamentos = false;
  }

  SelectSucursal(sucursal: ISucursalActivo): void {
    this.sucursalControl.setValue(sucursal.descripcionSucursal, { emitEvent: false });

    const ctrl = this.empleadoForm.get('idSucursal');
    ctrl?.setValue(sucursal.idSucursal);
    ctrl?.markAsTouched();
    ctrl?.markAsDirty();
    ctrl?.setErrors(null);

    this.visualizarSucursales = false;
  }

  SelectProducto(producto: IProductoActivo): void {
    this.productoControl.setValue(`${producto.codigoProducto}-${producto.nombreProducto}`);
    this.productoEmpleadoForm.get('idProducto')?.setValue(producto.idProducto);
    this.visualizarProductos = false;
  }

  SelectModelo(modelo: IModeloActivo): void {
    this.modeloControl.setValue(modelo.nombreModelo);
    this.productoEmpleadoForm.get('idModelo')?.setValue(modelo.idModelo);
    this.lstProductosFiltrados = this.lstProductos.filter((p) => p.idModelo === modelo.idModelo);
    this.visualizarModelos = false;
  }

  SelectMarca(marca: IMarcaActivo): void {
    this.marcaControl.setValue(marca.nombreMarca);
    this.visualizarMarcas = false;
    this.lstModelosFiltrados = this.lstModelos.filter((m) => m.idMarca === marca.idMarca);
    this.productoEmpleadoForm.get('idModelo')!.setValue(null);
    this.modeloControl.setValue('');
    this.productoEmpleadoForm.get('idProducto')?.setValue(null);
    this.productoControl.setValue('');
    this.lstProductosFiltrados = [];
    this.visualizarProductos = false;
  }

  SelectEmpleado(empleado: IEmpleadoActivo, campo: 'entrega' | 'recibe'): void {
    const nombreCompleto = `${empleado.nombreEmpleado} ${empleado.apellidoEmpleado}`;
    if (campo === 'entrega') {
      this.empleadoEntregaControl.setValue(nombreCompleto);
      this.productoEmpleadoForm.get('idEmpleadoEntrega')?.setValue(empleado.cedulaEmpleado);
      this.visualizarEmpleadosEntrega = false;
    } else {
      this.empleadoRecibeControl.setValue(nombreCompleto);
      this.productoEmpleadoForm.get('idEmpleadoRecibe')?.setValue(empleado.cedulaEmpleado);
      this.visualizarEmpleadosRecibe = false;
    }
  }

  SelectTipoActa(tipoActa: ITipoActaActivo): void {
    this.tipoActaControl.setValue(tipoActa.nombreTipoActa);
    this.productoEmpleadoForm.get('idTipoActa')?.setValue(tipoActa.idTipoActa);
    this.visualizarTiposActa = false;
  }

  HideCargos(): void {
    setTimeout(() => (this.visualizarCargos = false), 200);
  }

  HideDepartamentos(): void {
    setTimeout(() => (this.visualizarDepartamentos = false), 200);
  }
  HideSucursales(): void {
    setTimeout(() => (this.visualizarSucursales = false), 200);
  }
  HideProductos(): void {
    setTimeout(() => (this.visualizarProductos = false), 200);
  }
  HideModelos(): void {
    setTimeout(() => (this.visualizarModelos = false), 200);
  }
  HideMarcas(): void {
    setTimeout(() => this.visualizarMarcas = false, 200);
  }

  HideEmpleados(campo: 'entrega' | 'recibe'): void {
    setTimeout(() => {
      if (campo === 'entrega') {
        this.visualizarEmpleadosEntrega = false;
      } else {
        this.visualizarEmpleadosRecibe = false;
      }
    }, 200);
  }

  HideTipoActa(): void {
    setTimeout(() => this.visualizarTiposActa = false, 200);
  }

  GetSpanishLanguage() {
    return SpanishLanguage;
  }

  async validarCedula() {
    const control = this.empleadoForm.get('cedulaEmpleado');

    // Normaliza el valor
    const identificacion: string = (control?.value ?? '').toString().trim();

    // Helper para marcar error + foco
    const invalidarYFoco = (msgTitulo: string, msg: string, errorKey = 'cedulaInvalida') => {
      this.toastrService.error(msgTitulo, msg);
      control?.setErrors({ ...(control?.errors ?? {}), [errorKey]: true });
      control?.markAsTouched();
      setTimeout(() => {
        this.cedulaInput?.nativeElement?.focus();
        this.cedulaInput?.nativeElement?.select?.(); // opcional
      }, 0);
    };

    try {
      // Validaciones rápidas antes de cargar/consultar
      if (!identificacion) {
        invalidarYFoco('Error en la cédula', 'Debe ingresar la cédula.');
        return;
      }

      const esValida = this.appComponent.esCedulaValida(identificacion);
      if (!esValida) {
        invalidarYFoco('Error en la cédula', 'La cédula no es válida');
        return; // ✅ IMPORTANTÍSIMO
      }

      // Si estás editando, evita que choque contra sí mismo (si aplica)
      // const idActual = this.empleadoForm.get('idEmpleado')?.value;
      // const existe = this.lstEmpleados.some(e => e.cedulaEmpleado === identificacion && e.idEmpleado !== idActual);

      const existe = this.lstEmpleados?.some(emp => emp.cedulaEmpleado === identificacion);
      if (existe) {
        // Mejor warning, no error
        this.toastrService.warning('Cédula existente', 'La cédula ingresada ya pertenece a un empleado registrado.');
        control?.setErrors({ ...(control?.errors ?? {}), cedulaExistente: true });
        control?.markAsTouched();
        setTimeout(() => this.cedulaInput?.nativeElement?.focus(), 0);
        return;
      }

      this.loadingService.showLoading();

      // Consultamos la información del número de cédula
      const persona = await this.usuarioService.obtenerInformacionPersona(
        identificacion,
        'Recursos Humanos'
      );

      if (!persona) {
        this.toastrService.warning('Cédula', 'No se pudo obtener información de la cédula.');
        return; // ✅ no sigas si no hay data
      }

      // Patch seguro
      this.empleadoForm.patchValue({
        fechaNacimiento: persona.fcNac ? this.appComponent.formatearFechaCorta(persona.fcNac) : '',
        telefonoEmpleado: persona.medio1 ?? '',
        emailEmpleado: persona.email1 ?? ''
      });

      // Separar nombres y apellidos
      const nombreCompleto = (persona.nm ?? '').trim();
      if (!nombreCompleto) return;

      const separado = await this.usuarioService.obtenerApellidosNombresSeparados(nombreCompleto);

      if (separado?.esError) {
        this.toastrService.warning('Nombre', 'No se pudo separar nombres y apellidos.');
        this.empleadoForm.patchValue({
          nombreEmpleado: nombreCompleto,
          apellidoEmpleado: ''
        });
        return;
      }

      this.empleadoForm.patchValue({
        nombreEmpleado: separado?.nombres ?? '',
        apellidoEmpleado: separado?.apellidos ?? ''
      });

    } catch (error: any) {
      // Mensaje más coherente con lo que hace el método
      this.toastrService.error(
        'Error al validar cédula',
        error?.message ?? 'Solicitar soporte al departamento de TI.'
      );
    } finally {
      this.loadingService.hideLoading();
    }
  }

  descargarTable() {
    const columnas = [
      { key: 'descripcionSucursal', header: 'Sucursal' },
      { key: 'nombreDepartamento', header: 'Departamento' },
      { key: 'nombreCargo', header: 'Cargo' },
      { key: 'cedulaEmpleado', header: 'Cédula' },
      { key: 'nombreEmpleado', header: 'Nombre' },
      { key: 'apellidoEmpleado', header: 'Apellido' },
      { key: 'telefonoEmpleado', header: 'Teléfono' },
      { key: 'emailEmpleado', header: 'Correo' },
    ];

    const tabla = this.lstEmpleados.map((emp) => {
      const row: Record<string, any> = {};
      columnas.forEach((col) => {
        row[col.header] = emp[col.key as keyof IEmpleadoActivo];
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
    XLSX.utils.book_append_sheet(wb, ws, 'Empleados');
    XLSX.writeFile(wb, 'Empleados.xlsx');
  }

  enfotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;

    // Si no selecciona nada, marca error
    if (!input.files || input.files.length === 0) {
      this.imagenEmpleado = null;
      this.previewUrl = null;
      this.fotoRequeridaError = true;
      return;
    }

    const file = input.files[0];

    // ✅ apaga error apenas empieza (si termina inválido lo prendemos de nuevo)
    this.fotoRequeridaError = false;

    // valida tipo
    const validTypes = ['image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      this.toastrService.error('Foto inválida', 'Solo se permite PNG o JPG.');
      input.value = '';
      this.imagenEmpleado = null;
      this.previewUrl = null;
      this.fotoRequeridaError = true;
      return;
    }

    // valida tamaño
    const maxMB = 2;
    if (file.size > maxMB * 1024 * 1024) {
      this.toastrService.error('Foto muy grande', `Máximo ${maxMB}MB.`);
      input.value = '';
      this.imagenEmpleado = null;
      this.previewUrl = null;
      this.fotoRequeridaError = true;
      return;
    }

    // ✅ archivo válido
    this.imagenEmpleado = file;
    this.fotoRequeridaError = false;

    // preview
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  enFotoError(event: any) {
    event.target.src = 'assets/images/providers/Usuario.png';
  }

  AsignarProductoForm(empleadoData: IEmpleadoActivo) {
    this.productoControl = new FormControl('', Validators.required);
    this.modeloControl = new FormControl('', Validators.required);
    this.marcaControl = new FormControl('', Validators.required);
    this.empleadoEntregaControl = new FormControl('', Validators.required);
    this.empleadoRecibeControl = new FormControl('', Validators.required);

    this.productoEmpleadoForm = this.fb.group({
      fechaGeneracion: [{ value: this.getFechaActual(), disabled: true }],
      cedulaEmpleado: [{ value: empleadoData.cedulaEmpleado, disabled: true }],
      nombreEmpleado: [empleadoData.nombreEmpleado],
      apellidoEmpleado: [empleadoData.apellidoEmpleado],
      nombreCompleto: [{
        value: `${empleadoData.nombreEmpleado} ${empleadoData.apellidoEmpleado}`,
        disabled: true
      }],
      // TODO: PROBLEMA CON ESTOS DATOS AL ASIGNARSE PRIMERO EL PRODUCTO Y DESPUÉS LOS DATOS DEL ACTA, SE VAN VACÍOS
      idProducto: ['', Validators.required],
      idModelo: ['', Validators.required],
      idTipoActa: [1], // DATO DE PRUEBA PARA VERIFICAR QUE SE GUARDEN LOS PRODUCTOS
      idEmpleadoEntrega: [empleadoData.cedulaEmpleado], // DATO DE PRUEBA PARA VERIFICAR QUE SE GUARDEN LOS PRODUCTOS
      idEmpleadoRecibe: [empleadoData.cedulaEmpleado], // DATO DE PRUEBA PARA VERIFICAR QUE SE GUARDEN LOS PRODUCTOS
      observacion: ['', [Validators.maxLength(255)]], // DATO SE ENVIÓ VACÍO PORQUE NO SE LLENA ANTES DE LA ASIGNACIÓN DEL PRODUCTO A LA LISTA
      estaActivo: [true, Validators.required],
    });
  }

  getFechaActual(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }

  async VerDocumentosEmpleado(cedulaEmpleado: string) {
    try {
      this.loadingService.showLoading();
      let informacionEmpleado = this.lstEmpleados.find((x) => x.cedulaEmpleado == cedulaEmpleado);
      console.log('Ver documentos del empleado con cédula:', cedulaEmpleado, informacionEmpleado);
      if (!informacionEmpleado) {
        this.toastrService.error('Error', 'No se encontró información del empleado para generar los documentos.');
        return;
      }
      this.empleadoSeleccionado = `${informacionEmpleado.nombreEmpleado} ${informacionEmpleado.apellidoEmpleado}`;
      let informacionEmpleadoRequest: IInformacionEmpleado = {
        identificacionEmpleado: cedulaEmpleado,
        sueldo: informacionEmpleado?.sueldoEmpleado ?? 0,
        numeroCuenta: informacionEmpleado?.numeroCuenta ?? '',
      }
      //Generamos los documentos del empleado
      let responseGenerarDocumentos = await this.empleadosService.generarDocumentosEmpleado(informacionEmpleadoRequest);
      this.toastrService.success('Documentos generados', responseGenerarDocumentos);
      //Obtenemos el listado de documentos generados para el empleado
      const resp = await this.empleadosService.listarDocumentosEmpleado(cedulaEmpleado);
      this.lstDocumentosEmpleado = resp.documentos;
      this.zipUrl = resp.zip?.url ?? null;
      this.zipNombre = resp.zip?.nombre ?? null;
      $('#modalDocumentos').modal('show');
      this.changeDetector.detectChanges();
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al asignar el producto al empleado', error.message);
      } else {
        this.toastrService.error('Error al asignar el producto al empleado', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  // TODO: REVISAR ESTE MODA Y ARREGLAR EL UNDIFINED PORQUE EL MODAL TARDE EN RESPONER Y CARGAR LA INFORMACIÓN
  async AsignarProductoModal(cedulaEmpleado: string) {
    $('#productoModal').modal('show');
    $('#productoModal').off('show.bs.modal');
    $('#productoModal').on('show.bs.modal', async () => {
      const empleadoData: any = this.lstEmpleados.find((x) => x.cedulaEmpleado == cedulaEmpleado);
      this.lstProductosAsignados = await this.productosService.obtenerProductoPorEmpleado(cedulaEmpleado);

      this.lstProductos = await this.productosService.obtenerProductosSinEmpleado();
      if (this.lstProductos.length > 0)
        this.lstProductosFiltrados = [];

      this.lstModelos = await this.modelosService.obtenerModelos();
      if (this.lstModelos.length > 0)
        this.lstModelosFiltrados = [];
      this.lstMarcas = await this.marcasService.obtenerMarcas();
      if (this.lstMarcas.length > 0)
        this.lstMarcasFiltradas = [...this.lstMarcas];

      this.lstTipoActas = await this.tiposActaService.obtenerTipoActas()
      if (this.lstTipoActas.length > 0)
        this.lstTipoActaFiltradas = [...this.lstTipoActas];

      this.productoControl.reset('');
      this.modeloControl.reset('');
      this.marcaControl.reset('');
      this.lstProductosEmpleado = [];
      this.AsignarProductoForm(empleadoData!);
      this.changeDetector.detectChanges();
    });
  }

  AgregarProductoLista() {
    if (this.productoEmpleadoForm.invalid) {
      this.marcaControl.markAsTouched();
      this.modeloControl.markAsTouched();
      this.productoControl.markAsTouched();
      return;
    }

    const productoEmpleadoData = this.productoEmpleadoForm.getRawValue();
    // Validar duplicados en la lista temporal
    const yaAsignado = this.lstProductosEmpleado.some(p => p.idProducto === productoEmpleadoData.idProducto);
    if (yaAsignado) {
      this.toastrService.error('Error al agregar producto', 'El producto ya está en la lista.');
      return;
    }

    // Buscar información completa del producto
    const productoCompleto = this.lstProductosFiltrados.find(p => p.idProducto === productoEmpleadoData.idProducto);
    if (!productoCompleto) return;

    // Mapeo del objeto
    const nuevaAsignacion: IProductoEmpleadoActivo = {
      ...productoEmpleadoData,
      cedula: productoEmpleadoData.cedulaEmpleado,
      // PARTE INVALIDA PORQUE NO SE MAPEAN LOS DATOS AL LLEVAR VACÍOS
      idTipoActa: productoEmpleadoData.idTipoActa,
      idEmpleadoEntrega: productoEmpleadoData.idEmpleadoEntrega,
      idEmpleadoRecibe: productoEmpleadoData.idEmpleadoRecibe,
      observacion: productoEmpleadoData.observacion,
      producto: {
        idProducto: productoCompleto.idProducto,
        codigoProducto: productoCompleto.codigoProducto,
        nombreProducto: productoCompleto.nombreProducto,
        codigoCeco: productoCompleto.codigoCeco,
        ceco: productoCompleto.ceco,
        idModelo: productoCompleto.idModelo,
        idMarca: productoCompleto.idMarca,
        modelo: {
          idModelo: productoCompleto.idModelo,
          nombreModelo: productoCompleto.nombreModelo,
          marca: {
            idMarca: productoCompleto.idMarca,
            nombreMarca: productoCompleto.nombreMarca
          }
        }
      },
      fechaAsignacion: new Date(),
      estaActivo: true
    };

    this.lstProductosEmpleado.push(nuevaAsignacion);
    // Limpiar el producto de la lista
    this.productoEmpleadoForm.get('idProducto')?.reset('');
    this.productoEmpleadoForm.get('idModelo')?.reset('');
    // Limpiar los controles visuales de los select
    this.productoControl?.reset('');
    this.modeloControl?.reset('');
    this.marcaControl?.reset('');
  }

  EliminarProductoLista(index: number) {
    this.lstProductosEmpleado.splice(index, 1);
  }

  async GuardarProductosAsignados() {
    try {
      this.loadingService.showLoading();
      if (this.lstProductosEmpleado.length > 0) {
        try {
          await this.productosService.insertarProductoEmpleado(this.lstProductosEmpleado as any);
          Swal.fire({ text: 'Todos los productos han sido asignados correctamente', icon: 'success' }).then(() => { window.location.reload(); });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al asignar el producto al empleado', error.message);
          } else {
            this.toastrService.error('Error al asignar el producto al empleado', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.productoEmpleadoForm);
        this.toastrService.error('Error al asignar el producto al empleado', 'No se llenaron todos los campos necesarios.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al asignar el producto al empleado', error.message);
      } else {
        this.toastrService.error('Error al asignar el producto al empleado', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  esInvalido(campo: string): boolean {
    const c = this.empleadoForm.get(campo);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  getErrorMsg(campo: string): string {
    const control = this.empleadoForm.get(campo);

    if (!control || !control.errors) return '';
    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio.';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres.`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres.`;
    if (errors['min']) return `Debe ser mayor o igual a ${errors['min'].min}.`;
    if (errors['max']) return `Debe ser menor o igual a ${errors['max'].max}.`;
    if (errors['email']) return 'Correo electrónico inválido.';
    if (errors['pattern']) return 'Formato inválido.';
    if (errors['cedulaInvalida']) return 'La cédula no es válida.';
    if (errors['cedulaExistente']) return 'La cédula ya existe en el sistema.';
    return 'Campo inválido.';
  }


  public VerificarRolUsuario(rolesPermitidos: string[]): boolean {
    return this.lstRolesUsuario.some(role => rolesPermitidos.includes(role));
  }

  handleKeyDown(event: KeyboardEvent) { }

}