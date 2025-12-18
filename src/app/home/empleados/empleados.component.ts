import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
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
import * as XLSX from 'xlsx';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  previewUrl: string | ArrayBuffer | null = null;
  imagenEmpleado: File | null = null;

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
  ) { }

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
      nombreEmpleado: ['', [Validators.required, Validators.maxLength(100)]],
      apellidoEmpleado: ['', [Validators.required, Validators.maxLength(100)]],
      telefonoEmpleado: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(10)]],
      emailEmpleado: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      fotoEmpleado: [{ value: '', disabled: true }],
      idCargo: ['', [Validators.required]],
      idDepartamento: ['', [Validators.required]],
      idSucursal: ['', [Validators.required]],
      estaActivo: [true, [Validators.required]],
      fotoUrl: ['', [Validators.required]]
    });
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
          didOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          const mensajeEliminacion = await this.empleadosService.eliminarEmpleado(cedulaEmpleado);
          Swal.fire({
            text: `${mensajeEliminacion}`,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
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
    this.empleadoForm = this.fb.group({
      cedulaEmpleado: [empleadoActualizar!.cedulaEmpleado, [Validators.required],],
      nombreEmpleado: [empleadoActualizar!.nombreEmpleado,
      [Validators.required, Validators.maxLength(200)],],
      apellidoEmpleado: [empleadoActualizar!.apellidoEmpleado,
      [Validators.required, Validators.maxLength(200)],],
      telefonoEmpleado: [empleadoActualizar!.telefonoEmpleado,
      [Validators.required, Validators.minLength(9), Validators.maxLength(10)],],
      emailEmpleado: [empleadoActualizar!.emailEmpleado,
      [Validators.required, Validators.email, Validators.maxLength(100)],],
      fotoEmpleado: [empleadoActualizar!.fotoEmpleado, [Validators.required, Validators.maxLength(200)],],
      idCargo: [empleadoActualizar!.idCargo, [Validators.required, Validators.maxLength(300)],],
      idDepartamento: [empleadoActualizar!.idDepartamento, [Validators.required, Validators.maxLength(300)],],
      idSucursal: [empleadoActualizar!.idSucursal, [Validators.required, Validators.maxLength(300)],],
      estaActivo: [empleadoActualizar!.estaActivo, [Validators.required]],
      fotoUrl: [empleadoActualizar!.fotoUrl]
    });
    let informacionCargo = this.lstCargos.find((x) => x.idCargo == empleadoActualizar?.idCargo);
    let informacionDepartamento = this.lstDepartamentos.find((x) => x.idDepartamento == empleadoActualizar?.idDepartamento);
    let informacionSucursal = this.lstSucursales.find((x) => x.idSucursal == empleadoActualizar?.idSucursal);
    this.SelectCargo(informacionCargo!);
    this.SelectDepartamento(informacionDepartamento!);
    this.SelectSucursal(informacionSucursal!);
    this.empleadoForm.get('cedulaEmpleado')?.disable();
    this.empleadoForm.get('fotoEmpleado')?.disable();
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
          //Con Get Raw Value se puede enviar los datos bloqueados en el typeScript
          const empleadoData = this.empleadoForm.getRawValue();
          empleadoData.nombreEmpleado = empleadoData.nombreEmpleado.trim();
          empleadoData.apellidoEmpleado = empleadoData.apellidoEmpleado.trim();
          empleadoData.cedulaEmpleado = empleadoData.cedulaEmpleado.trim();
          empleadoData.emailEmpleado = empleadoData.emailEmpleado.trim();
          empleadoData.telefonoEmpleado = empleadoData.telefonoEmpleado.trim();

          const formData = new FormData();
          for (const key in empleadoData) {
            if (empleadoData[key] != null)
              formData.append(key, empleadoData[key]);
          }
          if (this.imagenEmpleado) {
            formData.append('ImagenEmpleado', this.imagenEmpleado);
          }
          const mensajeInsercion = await this.empleadosService.insertarEmpleado(formData);
          Swal.fire({
            text: mensajeInsercion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al agregar el empleado', error.message);
          } else {
            this.toastrService.error('Error al agregar el empleado', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        let foto = this.empleadoForm.get('fotoEmpleado')?.value;
        if (!foto) {
          this.toastrService.error('Error al agregar empleado', 'Debe seleccionar una foto');
          return;
        }
        this.appComponent.validateAllFormFields(this.empleadoForm);
        const telefono = this.empleadoForm.get('telefonoEmpleado');
        if (telefono?.hasError('minlength')) {
          this.toastrService.error('Error en el teléfono', 'Debe tener un mínimo de 9 dígitos.');
          return;
        }
        if (this.empleadoForm.invalid) {
          this.toastrService.error('Error al agregar el empleado', 'No se llenaron todos los campos necesarios.');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al agregar el empleado', error.message);
      } else {
        this.toastrService.error('Error al agregar el empleado', 'Solicitar soporte al departamento de TI.');
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
          const empleadoActualizadoData: IEmpleadoActivo = this.empleadoForm.getRawValue();
          const formData = new FormData();
          for (const key in empleadoActualizadoData) {
            const value = empleadoActualizadoData[key as keyof IEmpleadoActivo];
            if (value != null) {
              formData.append(key, value.toString());
            }
          }
          if (this.imagenEmpleado) {
            formData.append('ImagenEmpleado', this.imagenEmpleado);
          }
          const mensajeActualizacion = await this.empleadosService.actualizarEmpleado(empleadoActualizadoData.cedulaEmpleado, formData);
          Swal.fire({
            text: mensajeActualizacion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al actualizar el empleado', error.message);
          } else {
            this.toastrService.error('Error al actualizar el empleado', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        let foto = this.empleadoForm.get('fotoEmpleado')?.value;
        if (!foto) {
          this.toastrService.error('Error al agregar empleado', 'Debe seleccionar una foto');
          return;
        }
        this.appComponent.validateAllFormFields(this.empleadoForm);
        const telefono = this.empleadoForm.get('telefonoEmpleado');
        if (telefono?.hasError('minlength')) {
          this.toastrService.error('Error en el teléfono', 'Debe tener un mínimo de 9 dígitos.');
          return;
        }
        if (this.empleadoForm.invalid) {
          this.toastrService.error('Error al agregar el empleado', 'No se llenaron todos los campos necesarios.');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al actualizar el empleado', error.message);
      } else {
        this.toastrService.error('Error al actualizar el empleado', 'Solicitar soporte al departamento de TI.');
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
      .filter((departamento) => departamento.nombreDepartamento.toLowerCase().includes(filterValue))
      .slice(0, 4);
  }

  FilterSucursales(): void {
    const filterValue = this.sucursalControl.value.toLowerCase();
    this.lstSucursalesFiltrados = this.lstSucursales
      .filter((sucursal) => sucursal.descripcionSucursal.toLowerCase().includes(filterValue))
      .slice(0, 4);
  }

  SelectCargo(cargo: ICargoActivo): void {
    this.cargoControl.setValue(cargo.nombreCargo);
    this.empleadoForm.get('idCargo')?.setValue(cargo.idCargo);
    this.visualizarCargos = false;
  }

  SelectDepartamento(departamento: IDepartamentoActivo): void {
    this.departamentoControl.setValue(departamento.nombreDepartamento);
    this.empleadoForm.get('idDepartamento')?.setValue(departamento.idDepartamento);
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

  soloLetras(event: KeyboardEvent) {
    const key = event.key;
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(key);
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
      if (valor > 9) { valor -= 9;}
      suma += valor;
    }
    const digitoVerificador = parseInt(cedula[9]);
    const residuo = suma % 10;
    const resultado = residuo === 0 ? 0 : 10 - residuo;
    return resultado === digitoVerificador;
  }

  validarCedula() {
    let identificacion = this.empleadoForm.get('cedulaEmpleado')?.value;
    let esValidadorCedula = this.esCedulaValida(identificacion);
    if (!esValidadorCedula) {
      this.toastrService.error('Error en la cédula', 'La cédula no es valida');
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

  enfotoSeleccionada(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.imagenEmpleado = file;
    let fileName = file.name;
    // Cambiar los espacios por _
    fileName = fileName.replace(/\s+/g, '_');
    fileName = fileName.trim();
    // Actualizar el formControl con nombre de la foto
    this.empleadoForm.get('fotoEmpleado')?.setValue(fileName);
    // Vista previa de la imagen local y si no está en el servidor en Editar se mostrará el default Usuario.png 
    const reader = new FileReader();
    reader.onload = () => { this.previewUrl = reader.result; };
    reader.readAsDataURL(file);
  }

  enFotoError(event: any) {
    event.target.src = 'assets/images/providers/Usuario.png';
  }
}
