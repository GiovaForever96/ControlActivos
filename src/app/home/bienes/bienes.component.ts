import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { IProductoActivo, IProductoCustodioActivo } from 'src/app/models/producto-activo';
import { LoadingService } from 'src/app/services/loading.service';
import { ProductoActivoService } from 'src/app/services/producto-activo.service';
import { ToastrService } from 'src/app/services/toastr.service';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import { HomeComponent } from '../home.component';
import Swal from 'sweetalert2';
import { IProveedorActivo } from 'src/app/models/proveedor-activo';
import { ProveedorActivoService } from 'src/app/services/proveedor-activo.service';
import { IModeloActivo } from 'src/app/models/modelo-activo';
import { ModeloActivoService } from 'src/app/services/modelo-activo.service';
import { MarcaActivoService } from 'src/app/services/marca-activo.service';
import { IMarcaActivo } from 'src/app/models/marca-activo';
import { ICecoActivo } from 'src/app/models/ceco-activo';
import * as XLSX from 'xlsx';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-bienes',
  templateUrl: './bienes.component.html',
  styleUrls: ['./bienes.component.css']
})
export class BienesComponent implements OnInit {

  @ViewChild('dataTableProductos', { static: false }) tableProductos!: ElementRef;
  @ViewChild('btnActualizaProducto', { static: true }) btnActualizaProducto!: ElementRef;

  isEditing: boolean = false;
  lstProductos: IProductoActivo[] = [];
  lstProveedores: IProveedorActivo[] = [];
  lstProveedoresFiltrados: IProveedorActivo[] = [];
  lstModelos: IModeloActivo[] = [];
  lstModelosFiltrados: IModeloActivo[] = [];
  lstMarcas: IMarcaActivo[] = [];
  lstMarcasFiltradas: IMarcaActivo[] = [];
  lstCecos: ICecoActivo[] = [];
  lstCecosFiltrados: ICecoActivo[] = [];
  dtOptions: any;
  dataTable: any;
  productoForm!: FormGroup;
  proveedorControl: FormControl = new FormControl('', Validators.required);
  modeloControl: FormControl = new FormControl('', Validators.required);
  marcaControl: FormControl = new FormControl('', Validators.required);
  cecoControl: FormControl = new FormControl('', Validators.required);
  visualizarProveedor = false;
  visualizarModelo = false;
  visualizarMarca = false;
  visualizarCeco = false;
  fechaMax: string = new Date().toISOString().split('T')[0];
  fechaInvalida = false;

  constructor(
    private loadingService: LoadingService,
    private appComponent: AppComponent,
    private homeComponent: HomeComponent,
    private productosService: ProductoActivoService,
    private proveedoresService: ProveedorActivoService,
    private modeloService: ModeloActivoService,
    private marcasService: MarcaActivoService,
    private fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    (window as any).EliminarProducto = this.EliminarProducto.bind(this);
    (window as any).EditarProducto = this.EditarProducto.bind(this);
    this.CargarListadoProductos();
    this.CrearProductoForm();
    const body = this.el.nativeElement.ownerDocument.body;
    this.renderer.setStyle(body, 'overflow', '');
  }

  CrearProductoForm() {
    this.proveedorControl = new FormControl('', Validators.required);
    this.modeloControl = new FormControl('', Validators.required);
    this.marcaControl = new FormControl('', Validators.required);
    this.cecoControl = new FormControl('', Validators.required);
    this.productoForm = this.fb.group({
      codigoProducto: [{ value: '', disabled: true }],
      nombreProducto: ['', [Validators.required, Validators.maxLength(100)]],
      fechaCompraProducto: ['', [Validators.required]],
      valorCompraProducto: ['', [Validators.required, Validators.min(0.01)]],
      esBienaControl: [null, [Validators.required]],
      estaActivo: [true, [Validators.required]],
      idModelo: ['', [Validators.required]],
      codigoCeco: ['', [Validators.required]],
      rucProveedor: ['', [Validators.required]]
    });
  }

  async CargarListadoProductos() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Productos');
      this.lstProductos = await this.productosService.obtenerProductos();
      this.lstProveedores = await this.proveedoresService.obtenerProveedores();
      if (this.lstProveedores.length > 0) {
        this.lstProveedoresFiltrados = this.lstProveedores;
      }
      this.lstModelos = await this.modeloService.obtenerModelos();
      if (this.lstModelos.length > 0) {
        this.lstModelosFiltrados = [];
      }
      this.lstMarcas = await this.marcasService.obtenerMarcas();
      if (this.lstMarcas.length > 0)
        this.lstMarcasFiltradas = [...this.lstMarcas];

      this.lstCecos = await this.productosService.obtenerCecos();
      if (this.lstCecos.length > 0)
        this.lstCecosFiltrados = [...this.lstCecos];

      this.dtOptions = {
        data: this.lstProductos,
        info: false,
        language: { ...this.GetSpanishLanguage(), },
        columns: [
          { title: 'Id', data: 'idProducto', width: '50px' },
          { title: 'Codigo', data: 'codigoProducto' },
          { title: 'Nombre del Producto', data: 'nombreProducto' },
          {
            title: 'Fecha de Compra', data: 'fechaCompraProducto', render: (data: any) => {
              const fecha = new Date(data);
              return fecha.toLocaleDateString('es-ES');
            },
          },
          { title: 'Valor', data: 'valorCompraProducto' },
          { title: 'Está Activo', data: 'estaActivo', visible: false },
          {
            title: 'Es Bien',
            data: 'esBienaControl',
            searchable: false,
            render: function (data: any, type: any, full: any, meta: any) {
              return data ? 'Si' : 'No';
            },
            className: 'text-center',
          },
          { title: 'Marca', data: 'nombreMarca' },
          { title: 'Modelo', data: 'nombreModelo' },
          { title: 'Ceco', data: 'descripcionCeco' },
          { title: 'Proveedor', data: 'razonSocial' },
          {
            targets: -1,
            searchable: false,
            render: function (data: any, type: any, full: any, meta: any) {
              return `
              <button type="button" class="btn btn-primary btn-sm" onclick="EditarProducto(${full.idProducto})"><i class="fas fa-edit"></i></button>
              <button type="button" class="btn btn-danger btn-sm" onclick="EliminarProducto(${full.idProducto})"><i class="fas fa-trash-alt"></i></button>`;
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
      this.dataTable = $(this.tableProductos.nativeElement);
      this.dataTable.DataTable(this.dtOptions);
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener los productos', error.message);
      } else {
        this.toastrService.error('Error al obtener los productos', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async EliminarProducto(idProducto: number) {
    try {
      const productoSeleccionado = this.lstProductos.find((x) => x.idProducto == idProducto);
      const result = await Swal.fire({
        title: '¿Está seguro de dar de baja el producto?',
        text: 'Esta acción no se podrá revertir. Por favor, ingrese el motivo:',
        icon: 'warning',
        input: 'text',
        inputPlaceholder: 'Motivo',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, eliminar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) {
            return 'El motivo de la baja es obligatorio';
          }
          return null;
        }
      });
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando producto...',
          text: 'Por favor espere.',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); },
        });
        try {
          const mensajeEliminacion = await this.productosService.darBajaProductoActivo(idProducto, productoSeleccionado!);
          if (!mensajeEliminacion.includes('Error')) {
            Swal.fire({ text: `${mensajeEliminacion}`, icon: 'success', }).then(() => { window.location.reload(); });
          } else {
            this.toastrService.error('Error al eliminar el producto', mensajeEliminacion);
            Swal.close();
          }
        } catch (error: any) {
          this.toastrService.error('Error al eliminar el producto', error ?? 'Solicitar soporte al departamento de TI.');
          Swal.close();
        }
      } else {
        this.toastrService.info('Operación cancelada', 'El usuario cancelo la acción de eliminar el producto');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al eliminar el producto', error.message);
      } else {
        this.toastrService.error('Error al eliminar el producto', 'Solicitar soporte al departamento de TI.');
      }
    }
  }

  EditarProducto(idProducto: number) {
    const productoActualizar = this.lstProductos.find((x) => x.idProducto == idProducto);
    this.productoForm = this.fb.group({
      idProducto: [productoActualizar!.idProducto],
      codigoProducto: [productoActualizar!.codigoProducto, [Validators.required]],
      nombreProducto: [productoActualizar!.nombreProducto, [Validators.required, Validators.maxLength(100)]],
      fechaCompraProducto: [this.formatearFecha(productoActualizar!.fechaCompraProducto.toString()), Validators.required],
      valorCompraProducto: [productoActualizar!.valorCompraProducto, [Validators.required, Validators.min(0.01)]],
      esBienaControl: [productoActualizar!.esBienaControl, [Validators.required]],
      estaActivo: [productoActualizar!.estaActivo, [Validators.required]],
      idModelo: [productoActualizar!.idModelo, [Validators.required]],
      codigoCeco: [productoActualizar!.codigoCeco, [Validators.required]],
      rucProveedor: [productoActualizar!.rucProveedor, [Validators.required]]
    });

    let informacionProveedor = this.lstProveedores.find((x) => x.rucProveedor == productoActualizar?.rucProveedor);
    this.SelectProveedor(informacionProveedor!);
    let informacionModelo = this.lstModelos.find((x) => x.idModelo == productoActualizar?.idModelo);
    let informacionMarca = this.lstMarcas.find((x) => x.idMarca == informacionModelo?.idMarca);
    this.SelectMarca(informacionMarca!);
    this.SelectModelo(informacionModelo!);
    this.productoForm.get('codigoProducto')?.disable();
    this.productoForm.get('esBienaControl')?.disable();
    this.isEditing = true;
    let informacionCeco = this.lstCecos.find((x) => x.codigoCeco == productoActualizar?.codigoCeco);
    this.SelectCeco(informacionCeco!);
    this.changeDetector.detectChanges();
    this.btnActualizaProducto.nativeElement.click();
  }

  SetInactive() {
    this.homeComponent.SetInactive();
  }

  AbrirModal(esEdicion: boolean) {
    this.lstModelosFiltrados = [];
    this.isEditing = esEdicion;
    if (!esEdicion) {
      this.CrearProductoForm();
    }
    $('#productoModal').modal('show');
  }

  OnSubmit(): void {
    this.marcaControl.markAsTouched();
    this.cecoControl.markAsTouched();
    const valor = this.productoForm.get('valorCompraProducto')?.value;
    if (valor < 0.01) {
      this.appComponent.validateAllFormFields(this.productoForm);
      this.toastrService.error('Error en el valor de compra', 'No puede ingresar un valor menor a 0.01.');
      return;
    }
    const nombre = this.productoForm.get('nombreProducto');
    if (nombre?.hasError('maxlength')) {
      this.toastrService.error('Error en el nombre', 'La longitud máxima es 100.');
      return;
    }
    const nombreProducto = this.productoForm.get('nombreProducto')?.value.trim()
    if (!nombreProducto || nombreProducto.length < 1 ){
      this.toastrService.error('Error en el nombre', 'No puede contener solo espacios.');
      return;
    }
    if (this.isEditing) {
      this.ActualizarProducto();
    } else {
      this.CrearProducto();
    }
  }

  async CrearProducto() {
    try {
      this.loadingService.showLoading();
      if (this.productoForm.valid) {
        try {
          const productoData: IProductoActivo = this.productoForm.getRawValue();
          productoData.nombreProducto = productoData.nombreProducto.trim().toUpperCase();
          const mensajeInsercion = await this.productosService.insertarProducto(productoData);
          Swal.fire({ text: mensajeInsercion, icon: 'success', }).then(() => { window.location.reload(); });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al agregar el producto', error.message);
          } else {
            this.toastrService.error('Error al agregar el producto', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.productoForm);
        this.toastrService.error('Error al agregar el producto', 'No se llenaron todos los campos necesarios.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al agregar el producto', error.message);
      } else {
        this.toastrService.error('Error al agregar el producto', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async ActualizarProducto() {
    try {
      this.loadingService.showLoading();
      if (this.proveedorControl.value == '') {
        this.productoForm.patchValue({ rucProveedor: '' });
      }
      if (this.modeloControl.value == '') {
        this.productoForm.patchValue({ idModelo: '' });
      }
      if (this.cecoControl.value == '') {
        this.productoForm.patchValue({ codigoCeco: '' })
      }
      if (this.productoForm.valid) {
        try {
          const productoActualizadoData: IProductoActivo = this.productoForm.getRawValue();
          productoActualizadoData.nombreProducto = productoActualizadoData.nombreProducto.trim().toUpperCase();
          const mensajeActualizacion = await this.productosService.actualizarProducto(
            productoActualizadoData.idProducto, productoActualizadoData);
          Swal.fire({ text: mensajeActualizacion, icon: 'success', }).then(() => { window.location.reload(); });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al actualizar el producto', error.message);
          } else {
            this.toastrService.error('Error al actualizar el producto', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.productoForm);
        this.toastrService.error('Error al actualizar el producto', 'No se llenaron todos los campos necesarios.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al actualizar el producto', error.message);
      } else {
        this.toastrService.error('Error al actualizar el producto', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  FilterProveedores(): void {
    const filterValue = this.proveedorControl.value.toLowerCase();
    this.lstProveedoresFiltrados = this.lstProveedores
      .filter((proveedor) => proveedor.razonSocial.toLowerCase().includes(filterValue) || proveedor.rucProveedor.includes(filterValue))
      .slice(0, 4);
  }

  FilterModelos(): void {
    const filterValue = this.modeloControl.value.toLowerCase();
    this.lstModelosFiltrados = this.lstModelos
      .filter((modelo) => modelo.nombreModelo.toLowerCase().includes(filterValue))
      .slice(0, 4);
  }

  FilterMarcas(): void {
    const filterValue = this.marcaControl.value!.toLowerCase();
    this.lstMarcasFiltradas = this.lstMarcas.filter(marca => marca.nombreMarca.toLowerCase().includes(filterValue));
  }

  FilterCecos(): void {
    const filterValue = this.cecoControl.value!.toLowerCase();
    this.lstCecosFiltrados = this.lstCecos.filter(ceco => ceco.descripcionCeco.toLowerCase().includes(filterValue) || ceco.codigoCeco.includes(filterValue));
  }

  SelectProveedor(proveedor: IProveedorActivo): void {
    this.proveedorControl.setValue(proveedor.razonSocial);
    this.productoForm.get('rucProveedor')?.setValue(proveedor.rucProveedor);
    this.visualizarProveedor = false;
  }

  SelectModelo(modelo: IModeloActivo): void {
    this.modeloControl.setValue(modelo.nombreModelo);
    this.productoForm.get('idModelo')?.setValue(modelo.idModelo);
    this.visualizarModelo = false;
  }

  SelectMarca(marca: IMarcaActivo): void {
    this.marcaControl.setValue(marca.nombreMarca);
    this.visualizarMarca = false;
    this.lstModelosFiltrados = this.lstModelos.filter((m) => m.idMarca === marca.idMarca);
    this.productoForm.get('idModelo')!.setValue(null);
    this.modeloControl.setValue('');
  }

  SelectCeco(ceco: ICecoActivo): void {
    this.cecoControl.setValue(`${ceco.codigoCeco}-${ceco.descripcionCeco}`);
    this.productoForm.get('codigoCeco')?.setValue(ceco.codigoCeco);
    this.visualizarCeco = false;
    this.generarNuevoCodigo();
  }

  generarNuevoCodigo() {
    if (this.isEditing == false) {
      let codigoCeco = this.productoForm.get('codigoCeco')?.value;
      let esBienaControl = this.productoForm.get('esBienaControl')?.value;
      const codigoProductoSeleccionado = this.lstProductos.filter(c => c.codigoCeco === codigoCeco && c.esBienaControl == esBienaControl) as IProductoActivo[] ?? [];
      if (codigoProductoSeleccionado.length == 0) {
        this.productoForm.get('codigoProducto')?.setValue(`${codigoCeco}${1}`);
        return;
      }

      let lstCodigos: number[] = [];
      codigoProductoSeleccionado.forEach(x => {
        let codigoProducto = x.codigoProducto;
        const productoSeparado = codigoProducto.split('.');
        const ultimoIndice = productoSeparado.length - 1;
        const ultimoValor = productoSeparado[ultimoIndice];
        lstCodigos.push(Number(ultimoValor));
      });

      lstCodigos.sort((a, b) => b - a);
      const ultimoCodigo = lstCodigos[0];
      const nuevoCodigo = ultimoCodigo + 1;
      this.productoForm.get('codigoProducto')?.setValue(`${codigoCeco}${nuevoCodigo}`);
    }
  }

  onChangeTipo(): void {
    this.cecoControl.setValue('');
    this.productoForm.get('codigoCeco')?.setValue('');
    this.productoForm.get('codigoProducto')?.setValue('');
    this.visualizarCeco = false;
  }

  HideProveedores(): void {
    setTimeout(() => (this.visualizarProveedor = false), 200);
  }

  HideModelos(): void {
    setTimeout(() => (this.visualizarModelo = false), 200);
  }

  HideMarcas(): void {
    setTimeout(() => this.visualizarMarca = false, 200);
  }

  HideCecos(): void {
    setTimeout(() => this.visualizarCeco = false, 200);
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

  soloDecimal(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^\d+$/.test(key)) {
      if (key === '.' && !input.value.includes('.')) {
        return;
      }
      event.preventDefault();
    }
  }

  validarFecha(event: any) {
    const fecha = event.target.value;
    if (this.fechaInvalida = fecha > this.fechaMax) {
      this.toastrService.error('Error en la fecha', 'La fecha no puede ser mayor a la fecha actual.');
      this.productoForm.get('fechaCompraProducto')?.setValue(this.fechaMax);
    }
  }

  enCodigoProductoInput() {
    this.productoForm.get('codigoProducto')?.setValue('');
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  descargarTable() {
    const columnas = [
      { key: 'idProducto', header: 'Id' },
      { key: 'codigoProducto', header: 'Código' },
      { key: 'nombreProducto', header: 'Nombre' },
      { key: 'fechaCompraProducto', header: 'Fecha de Compra' },
      { key: 'valorCompraProducto', header: 'Valor de Compra' },
      { key: 'esBienaControl', header: 'Es Bien' },
      { key: 'nombreMarca', header: 'Marca' },
      { key: 'nombreModelo', header: 'Modelo' },
      { key: 'descripcionCeco', header: 'Ceco' },
      { key: 'razonSocial', header: 'Proveedor' },
    ];

    const tabla = this.lstProductos.map((prod) => {
      const row: Record<string, any> = {};
      columnas.forEach((col) => {
        let valor = prod[col.key as keyof IProductoActivo];
        if (col.key === 'fechaCompraProducto' && valor) {
          valor = this.formatearFecha(valor as string);
        }
        if (col.key === 'esBienaControl') {
          valor = valor ? 'Sí' : 'No';
        }
        row[col.header] = valor;
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
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, 'Productos.xlsx');
  }
}
