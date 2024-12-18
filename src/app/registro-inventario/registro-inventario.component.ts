import { ChangeDetectorRef, Component, ElementRef, Renderer2 } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { IInventarioActivo } from '../models/inventario-activo';
import { LoadingService } from '../services/loading.service';
import { AppComponent } from '../app.component';
import { InventarioActivoService } from '../services/inventario-activo.service';
import { ToastrService } from '../services/toastr.service';
import { FormControl, Validators } from '@angular/forms';
import { IProductoCustodioActivo } from '../models/producto-activo';
import { ProductoActivoService } from '../services/producto-activo.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-inventario',
  templateUrl: './registro-inventario.component.html',
  styleUrls: ['./registro-inventario.component.css']
})
export class RegistroInventarioComponent {

  formats: BarcodeFormat[] = [BarcodeFormat.QR_CODE];
  cameras: MediaDeviceInfo[] = [];
  lstInventarios: IInventarioActivo[] = [];
  selectedDevice: MediaDeviceInfo | null = null;
  lstInventariosFiltrados: IInventarioActivo[] = [];
  visualizarOpciones = false;
  inventarioControl = new FormControl('', Validators.required);
  idInventarioRegistrar: number = 0;
  idProducto: number = 0;
  informacionProductoCustodio: IProductoCustodioActivo = { idProductoCustodio: 1, idCustodio: 0, idProducto: 0, estaActivo: false, custodio: undefined, producto: undefined, seleccionado: false };
  lstDispositivosValidos: string[] = [];

  constructor(private loadingService: LoadingService,
    public appComponent: AppComponent,
    private inventariosService: InventarioActivoService,
    private productosService: ProductoActivoService,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private el: ElementRef,
    private renderer: Renderer2,
    private toastrService: ToastrService) { }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    // Filtrar las cámaras por tipo y seleccionar la trasera
    const rearCamera = devices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear'));
    if (rearCamera) {
      this.selectedDevice = rearCamera;
    } else if (devices.length > 0) {
      // Como fallback, seleccionar la primera cámara disponible
      this.selectedDevice = devices[0];
    }
  }

  listCameras(): void {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      this.cameras = devices.filter(device => device.kind === 'videoinput');
      if (this.cameras.length > 0) {
        // Selecciona la primera cámara disponible por defecto
        this.selectedDevice = this.cameras[0];
      }
    }).catch(err => {
      console.error('Error al enumerar dispositivos:', err);
    });
  }

  onCameraSelected(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const deviceId = selectElement.value;
    this.selectedDevice = this.cameras.find(device => device.deviceId === deviceId) || null;
  }

  onCamerasNotFound(): void {
    this.toastrService.error('Inicializar cámara', 'No se encontraron cámaras');
  }

  ngOnInit() {
    this.ConsultarDispositivosVinculados();
    const body = this.el.nativeElement.ownerDocument.body;
    this.renderer.setStyle(body, 'overflow', '');
  }

  async ConsultarDispositivosVinculados() {
    try {
      this.loadingService.showLoading();
      this.lstDispositivosValidos = await this.inventariosService.obtenerIpPermitida();
      if (this.lstDispositivosValidos.length > 0) {
        let idDispositivo = this.appComponent.obtenerOGenerarIdentificador();
        let dispositvoRegistrado = this.lstDispositivosValidos.find(x => x === idDispositivo);
        if (dispositvoRegistrado == null) {
          Swal.fire({
            text: 'No tienes permiso para acceder a esta página.',
            icon: 'error',
          }).then(() => {
            this.router.navigate([`iniciar-sesion`])
          });
        } else {
          this.CargarListadoInventarios();
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener el listado de inventarios', error.message);
      } else {
        this.toastrService.error('Error al obtener el listado de inventarios', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async CargarListadoInventarios() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Registro inventario');
      this.lstInventarios = await this.inventariosService.obtenerInventarios();
      if (this.lstInventarios.length > 0) {
        this.lstInventariosFiltrados = [...this.lstInventarios];
        this.listCameras();
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener el listado de inventarios', error.message);
      } else {
        this.toastrService.error('Error al obtener el listado de inventarios', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async RegistrarInventario() {
    try {
      this.loadingService.showLoading();
      if (this.idInventarioRegistrar != 0 && this.idProducto != 0) {
        await this.productosService.registrarProductoInventario(this.idInventarioRegistrar, this.idProducto);
        Swal.fire({
          text: "Bien registrado exitosamente",
          icon: 'success',
        }).then(() => {
          this.idProducto = 0;
          this.informacionProductoCustodio = { idProductoCustodio: 0, idCustodio: 0, idProducto: 0, estaActivo: false, custodio: undefined, producto: undefined, seleccionado: false };
          this.changeDetector.detectChanges();
        });
      } else {
        this.toastrService.error('Error al registrar el activo', 'Solicitar soporte al departamento de TI.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al registrar el activo', error.message);
      } else {
        this.toastrService.error('Error al registrar el activo', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  SeleccionarInventario() {
    this.idInventarioRegistrar = 0;
    this.inventarioControl = new FormControl('', Validators.required);
  }

  async handleQrCodeResult(result: any) {
    try {
      this.loadingService.showLoading();
      let arrayUrl = result.split('/');
      let idProducto = arrayUrl[arrayUrl.length - 1];
      if (arrayUrl.length == 1) {
        this.toastrService.error('Error al obtener información QR', 'Solicitar soporte al departamento de TI.');
      } else {
        this.informacionProductoCustodio = await this.productosService.obtenerInformacionProductoCustodioPorIdProducto(idProducto);
        if (this.informacionProductoCustodio.idProducto == 0) {
          this.toastrService.error('Error al obtener la información del activo', 'Solicitar soporte al departamento de TI.');
        } else {
          this.idProducto = Number(idProducto);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener la información del activo', error.message);
      } else {
        this.toastrService.error('Error al obtener la información del activo', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  FilterInventarios(): void {
    const filterValue = this.inventarioControl.value!.toLowerCase();
    this.idInventarioRegistrar = 0;
    this.lstInventariosFiltrados = this.lstInventarios.filter(inventario =>
      inventario.descripcionInventario.toLowerCase().includes(filterValue)
    );
  }

  SelectCustodio(inventario: IInventarioActivo): void {
    this.inventarioControl.setValue(inventario.descripcionInventario);
    this.idInventarioRegistrar = inventario.idInventario;
    this.visualizarOpciones = false;
  }

  HideOptions(): void {
    setTimeout(() => this.visualizarOpciones = false, 200);
  }

}
