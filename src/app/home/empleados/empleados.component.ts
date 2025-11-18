import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { IEmpleadoActivo } from 'src/app/models/empleado-activo';
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
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
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

  isEditing: boolean = false;
  lstEmpleados: IEmpleadoActivo[] = [];
  lstCargos: ICargoActivo[] = [];
  lstCargosFiltrados: ICargoActivo[] = [];
  lstDepartamentos: IDepartamentoActivo[] = [];
  lstDepartamentosFiltrados: IDepartamentoActivo[] = [];
  lstSucursales: ISucursalActivo[] = [];
  lstSucursalesFiltrados: ISucursalActivo[] = [];
  dtOptions: any;
  dataTable: any;
  empleadoForm!: FormGroup;
  cargoControl: FormControl = new FormControl('', Validators.required);
  departamentoControl: FormControl = new FormControl('', Validators.required);
  sucursalControl: FormControl = new FormControl('', Validators.required);
  visualizarCargos = false;
  visualizarDepartamentos = false;
  visualizarSucursales = false;

  constructor(
    private loadingService: LoadingService,
    private appComponent: AppComponent,
    private homeComponent: HomeComponent,
    private empleadosService: EmpleadoActivoService,
    private cargosService: CargoActivoService,
    private departamentosService: DepartamentoActivoService,
    private sucursalesService: SucursalActivoService,
    private fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    (window as any).EliminarEmpleado = this.EliminarEmpleado.bind(this);
    (window as any).EditarEmpleado = this.EditarEmpleado.bind(this);
    this.CargarListadoEmpleados();
    this.CrearEmpleadoForm();
    const body = this.el.nativeElement.ownerDocument.body;
    this.renderer.setStyle(body, 'overflow', '');
  }

  CrearEmpleadoForm() {
    this.cargoControl = new FormControl('', Validators.required);
    this.departamentoControl = new FormControl('', Validators.required);
    this.sucursalControl = new FormControl('', Validators.required);
    this.empleadoForm = this.fb.group({
      cedulaEmpleado: ['', [Validators.required]],
      nombreEmpleado: ['', [Validators.required]],
      apellidoEmpleado: ['', [Validators.required]],
      telefonoEmpleado: ['', [Validators.required]],
      emailEmpleado: ['', [Validators.required, Validators.email]],
      fotoEmpleado: [''],
      idCargo: ['', [Validators.required]],
      idDepartamento: ['', [Validators.required]],
      idSucursal: ['', [Validators.required]],
      estaActivo: [true, [Validators.required]],
    });
  }

  async CargarListadoEmpleados() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Empleados');
      this.lstEmpleados = await this.empleadosService.obtenerEmpleados();
      this.lstCargos = await this.cargosService.obtenerCargos();
      this.lstDepartamentos =
        await this.departamentosService.obtenerDepartamentos();
      this.lstSucursales = await this.sucursalesService.obtenerSucursales();
      this.lstSucursales = this.lstSucursales.sort((a, b) =>
        a.descripcionSucursal.localeCompare(b.descripcionSucursal)
      );
      if (this.lstCargos.length > 0) {
        this.lstCargosFiltrados = this.lstCargos;
      }
      if (this.lstDepartamentos.length > 0) {
        this.lstDepartamentosFiltrados = this.lstDepartamentos;
      }
      if (this.lstSucursales.length > 0) {
        this.lstSucursalesFiltrados = this.lstSucursales;
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
            render: function (data: any, type: any, full: any, meta: any) {
              return `
                <button class="btn btn-sm btn-primary" onclick="EditarEmpleado('${full.cedulaEmpleado}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="EliminarEmpleado('${full.cedulaEmpleado}')"><i class="fas fa-trash-alt"></i></button>`;
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
        this.toastrService.error(
          'Error al obtener los empleados',
          error.message
        );
      } else {
        this.toastrService.error(
          'Error al obtener los empleados',
          'Solicitar soporte al departamento de TI.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async EliminarEmpleado(cedulaEmpleado: string) {
    try {
      const empleadoSeleccionado = this.lstEmpleados.find(
        (x) => x.cedulaEmpleado === cedulaEmpleado
      );
      const result = await Swal.fire({
        title: `¿Estás seguro de eliminar el empleado ${
          empleadoSeleccionado!.nombreEmpleado
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
          title: 'Eliminando empleado...',
          text: 'Por favor espere.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          const mensajeEliminacion =
            await this.empleadosService.eliminarEmpleado(cedulaEmpleado);
          Swal.fire({
            text: `${mensajeEliminacion}`,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          this.toastrService.error(
            'Error al eliminar empleado',
            'Solicitar soporte al departamento de TI.'
          );
          Swal.close();
        }
      } else {
        this.toastrService.info(
          'Operación cancelada',
          'El usuario cancelo la acción de eliminar el empleado'
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error(
          'Error al eliminar el empleado',
          error.message
        );
      } else {
        this.toastrService.error(
          'Error al eliminar el empleado',
          'Solicitar soporte al departamento de TI.'
        );
      }
    }
  }

  EditarEmpleado(cedulaEmpleado: string) {
    const empleadoActualizar = this.lstEmpleados.find(
      (x) => x.cedulaEmpleado == cedulaEmpleado
    );
    this.empleadoForm = this.fb.group({
      cedulaEmpleado: [
        empleadoActualizar!.cedulaEmpleado,
        [Validators.required],
      ],
      nombreEmpleado: [
        empleadoActualizar!.nombreEmpleado,
        [Validators.required, Validators.maxLength(200)],
      ],
      apellidoEmpleado: [
        empleadoActualizar!.apellidoEmpleado,
        [Validators.required, Validators.maxLength(200)],
      ],
      telefonoEmpleado: [
        empleadoActualizar!.telefonoEmpleado,
        [Validators.required, Validators.maxLength(10)],
      ],
      emailEmpleado: [
        empleadoActualizar!.emailEmpleado,
        [Validators.required, Validators.maxLength(300)],
      ],
      fotoEmpleado: [
        empleadoActualizar!.fotoEmpleado,
        [Validators.required, Validators.maxLength(200)],
      ],
      idCargo: [
        empleadoActualizar!.idCargo,
        [Validators.required, Validators.maxLength(300)],
      ],
      idDepartamento: [
        empleadoActualizar!.idDepartamento,
        [Validators.required, Validators.maxLength(300)],
      ],
      idSucursal: [
        empleadoActualizar!.idSucursal,
        [Validators.required, Validators.maxLength(300)],
      ],
      estaActivo: [empleadoActualizar!.estaActivo, [Validators.required]],
    });
    let informacionCargo = this.lstCargos.find(
      (x) => x.idCargo == empleadoActualizar?.idCargo
    );
    let informacionDepartamento = this.lstDepartamentos.find(
      (x) => x.idDepartamento == empleadoActualizar?.idDepartamento
    );
    let informacionSucursal = this.lstSucursales.find(
      (x) => x.idSucursal == empleadoActualizar?.idSucursal
    );
    this.SelectCargo(informacionCargo!);
    this.SelectDepartamento(informacionDepartamento!);
    this.SelectSucursal(informacionSucursal!);

    // this.cargoControl.setValue(empleadoActualizar!.idCargo);
    // this.departamentoControl.setValue(empleadoActualizar!.idDepartamento);
    // this.sucursalControl.setValue(empleadoActualizar!.idSucursal);
    console.log(this.empleadoForm.value);
    this.isEditing = true;
    this.changeDetector.detectChanges();
    this.btnActualizaEmpleado.nativeElement.click();
  }

  SetInactive() {
    this.homeComponent.SetInactive();
  }

  AbrirModal(esEdicion: boolean) {
    this.isEditing = esEdicion;
    if (!esEdicion) {
      this.CrearEmpleadoForm();
    }
    $('#empleadoModal').modal('show');
  }

  OnSubmit(): void {
    let empleadoNombre = this.empleadoForm.get('nombreEmpleado')?.value;
    let empleadoApellido = this.empleadoForm.get('apellidoEmpleado')?.value;
    let empleadoCedula = this.empleadoForm.get('cedulaEmpleado')?.value;
    let empleadoEmail = this.empleadoForm.get('emailEmpleado')?.value;
    let empleadoTelefono = this.empleadoForm.get('telefonoEmpleado')?.value;
    if (
      empleadoNombre.trim().length === 0 ||
      empleadoApellido.trim().length === 0 ||
      empleadoCedula.trim().length === 0 ||
      empleadoEmail.trim().length === 0 ||
      empleadoTelefono.trim().length === 0
    ) {
      this.toastrService.error(
        'Error al guardar el cargo',
        'Los campos por guardar no pueden estar vacíos o contener solo espacios.'
      );
      return;
    }
    if (this.isEditing) {
      this.ActualizarEmpleado();
    } else {
      this.CrearEmpleado();
    }
  }

  async CrearEmpleado() {
    try {
      this.loadingService.showLoading();
      if (this.empleadoForm.valid) {
        try {
          const empleadoData: IEmpleadoActivo = this.empleadoForm.value;
          empleadoData.nombreEmpleado = empleadoData.nombreEmpleado.trim();
          empleadoData.apellidoEmpleado = empleadoData.apellidoEmpleado.trim();
          empleadoData.cedulaEmpleado = empleadoData.cedulaEmpleado.trim();
          empleadoData.emailEmpleado = empleadoData.emailEmpleado.trim();
          empleadoData.telefonoEmpleado = empleadoData.telefonoEmpleado.trim();
          const mensajeInsercion = await this.empleadosService.insertarEmpleado(
            empleadoData
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
              'Error al agregar el empleado',
              error.message
            );
          } else {
            this.toastrService.error(
              'Error al agregar el empleado',
              'Solicitar soporte al departamento de TI.'
            );
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.empleadoForm);
        this.toastrService.error(
          'Error al agregar el empleado',
          'No se llenaron todos los campos necesarios.'
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al agregar el empleado', error.message);
      } else {
        this.toastrService.error(
          'Error al agregar el empleado',
          'Solicitar soporte al departamento de TI.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async ActualizarEmpleado() {
    try {
      this.loadingService.showLoading();
      if (this.cargoControl.value == '') {
        this.empleadoForm.patchValue({ idCargo: '' });
      }

      if (this.departamentoControl.value == '') {
        this.empleadoForm.patchValue({ idDepartamento: '' });
      }

      if (this.sucursalControl.value == '') {
        this.empleadoForm.patchValue({ idSucursal: '' });
      }

      if (this.empleadoForm.valid) {
        try {
          const empleadoActualizadoData: IEmpleadoActivo =
            this.empleadoForm.value;
          const mensajeActualizacion =
            await this.empleadosService.actualizarEmpleado(
              empleadoActualizadoData.cedulaEmpleado,
              empleadoActualizadoData
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
              'Error al actualizar el empleado',
              error.message
            );
          } else {
            this.toastrService.error(
              'Error al actualizar el empleado',
              'Solicitar soporte al departamento de TI.'
            );
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.empleadoForm);
        this.toastrService.error(
          'Error al actualizar el empleado',
          'No se llenaron todos los campos necesarios.'
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error(
          'Error al actualizar el empleado',
          error.message
        );
      } else {
        this.toastrService.error(
          'Error al actualizar el empleado',
          'Solicitar soporte al departamento de TI.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  FilterCargos(): void {
    const filterValue = this.cargoControl.value.toLowerCase();
    this.lstCargosFiltrados = this.lstCargos
      .filter((cargo) => cargo.nombreCargo.toLowerCase().includes(filterValue))
      .slice(0, 4);
  }

  FilterDepartamentos(): void {
    const filterValue = this.departamentoControl.value.toLowerCase();
    this.lstDepartamentosFiltrados = this.lstDepartamentos
      .filter((departamento) =>
        departamento.nombreDepartamento.toLowerCase().includes(filterValue)
      )
      .slice(0, 4);
  }

  FilterSucursales(): void {
    const filterValue = this.sucursalControl.value.toLowerCase();
    this.lstSucursalesFiltrados = this.lstSucursales
      .filter((sucursal) =>
        sucursal.descripcionSucursal.toLowerCase().includes(filterValue)
      )
      .slice(0, 4);
  }

  SelectCargo(cargo: ICargoActivo): void {
    this.cargoControl.setValue(cargo.nombreCargo);
    this.empleadoForm.get('idCargo')?.setValue(cargo.idCargo);
    this.visualizarCargos = false;
  }

  SelectDepartamento(departamento: IDepartamentoActivo): void {
    this.departamentoControl.setValue(departamento.nombreDepartamento);
    this.empleadoForm
      .get('idDepartamento')
      ?.setValue(departamento.idDepartamento);
    this.visualizarDepartamentos = false;
  }

  SelectSucursal(sucursal: ISucursalActivo): void {
    this.sucursalControl.setValue(sucursal.descripcionSucursal);
    this.empleadoForm.get('idSucursal')?.setValue(sucursal.idSucursal);
    this.visualizarSucursales = false;
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
  GetSpanishLanguage() {
    return SpanishLanguage;
  }

  soloNumeros(event: KeyboardEvent): void {
    const key = event.key;
    if (!/^\d+$/.test(key)) {
      event.preventDefault();
    }
  }

  private esCedulaValida(cedula: string): boolean {
    if (!cedula || cedula.length !== 10) {
      return false;
    }

    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) {
      return false;
    }

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < coeficientes.length; i++) {
      let valor = parseInt(cedula[i]) * coeficientes[i];
      if (valor > 9) {
        valor -= 9;
      }
      suma += valor;
    }

    const digitoVerificador = parseInt(cedula[9]);
    const residuo = suma % 10;
    const resultado = residuo === 0 ? 0 : 10 - residuo;

    return resultado === digitoVerificador;
  }

  validarCedula() {
    let identificacion = this.empleadoForm.get('cedulaEmpleado')?.value;
    console.log(identificacion);
    let esValidadorCedula = this.esCedulaValida(identificacion);
    console.log(esValidadorCedula);
    if (!esValidadorCedula) {
      this.toastrService.error('Error', 'La cédula es incorrecta');
    }
  }

  descargarTable() {
    
  }
}
