import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoActivoService } from '../services/producto-activo.service';
import { ToastrService } from '../services/toastr.service';
import { LoadingService } from '../services/loading.service';
import { IProductoCustodioActivo } from '../models/producto-activo';
import { ICustodioActivo } from '../models/custodio-activo';
import { CustodioActivoService } from '../services/custodio-activo.service';
import { FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-consulta-informacion',
  templateUrl: './consulta-informacion.component.html',
  styleUrls: ['./consulta-informacion.component.css']
})
export class ConsultaInformacionComponent {

  idProducto: string | null = null;
  informacionProductoCustodio: IProductoCustodioActivo = { idProductoCustodio: 0, idCustodio: 0, idProducto: 0, estaActivo: false, custodio: undefined, producto: undefined };
  lstCustodiosActivo: ICustodioActivo[] = [];
  lstCustodiosActivoFiltrados: ICustodioActivo[] = [];
  custodioControl = new FormControl('', Validators.required);
  visualizarOpciones = false;

  constructor(private route: ActivatedRoute,
    private toastrService: ToastrService,
    private loadingService: LoadingService,
    public appComponent: AppComponent,
    private renderer: Renderer2,
    private el: ElementRef,
    private custodiosService: CustodioActivoService,
    private productosService: ProductoActivoService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.idProducto = params.get('idProducto');
    });
    if (this.idProducto != null) {
      this.ConsultarInformacionProducto();
    }
  }

  async ConsultarInformacionProducto() {
    try {
      this.loadingService.showLoading();
      this.informacionProductoCustodio = await this.productosService.obtenerInformacionProductoCustodioPorIdProducto(this.idProducto!);
      if (this.informacionProductoCustodio.idProducto == 0) {
        this.toastrService.error('Error al obtener la información del activo', 'Solicitar soporte al departamento de TI.');
      }
      this.lstCustodiosActivo = await this.custodiosService.obtenerInformacionProductoCustodio();
      this.lstCustodiosActivoFiltrados = [...this.lstCustodiosActivo];
      console.log(this.informacionProductoCustodio.custodio?.nombreApellidoCustodio);
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

  FilterCustodios(): void {
    const filterValue = this.custodioControl.value!.toLowerCase();
    this.lstCustodiosActivoFiltrados = this.lstCustodiosActivo.filter(custodio =>
      custodio.nombreApellidoCustodio.toLowerCase().includes(filterValue)
    );
  }

  SelectCustodio(custodio: ICustodioActivo): void {
    this.custodioControl.setValue(custodio.nombreApellidoCustodio);
    this.visualizarOpciones = false;
    console.log(this.custodioControl);
  }

  HideOptions(): void {
    setTimeout(() => this.visualizarOpciones = false, 200);
  }

  async RegistrarCustodioProducto() {
    try {
      this.loadingService.showLoading();
      let idCustodio: string = '';
      if (this.custodioControl.value != '') {
        let informacionCustodio = this.lstCustodiosActivo.find(x => x.nombreApellidoCustodio == this.custodioControl.value);
        //Creamos el custodio
        if (informacionCustodio == null) {
          let mensajeRespuesta = await this.custodiosService.insertarCustodio({
            idCustodio: 0,
            nombreApellidoCustodio: this.custodioControl.value?.toUpperCase() ?? '',
            estaActivo: true
          });
          idCustodio = mensajeRespuesta.split(';')[1];
        } else {
          idCustodio = informacionCustodio!.idCustodio.toString();
        }
        //Asignamos el custodio al producto
        const mensajeInsercion = await this.productosService.insertarCustodioProducto({
          idCustodio: Number(idCustodio), idProducto: Number(this.idProducto!),
          idProductoCustodio: 0,
          estaActivo: true
        })
        Swal.fire({
          text: mensajeInsercion,
          icon: 'success',
        }).then(() => {
          window.location.reload();
        });
      } else {
        this.toastrService.error("Error registro custodio", "No se ingreso el nombre del custodio")
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener los beneficios de los paquetes', error.message);
      } else {
        this.toastrService.error('Error al obtener los beneficios de los paquetes', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async DarDeBajaActivo() {
    try {
      const { value: inputValue } = await Swal.fire({
        title: 'Ingrese el motivo de baja',
        input: 'text',
        inputLabel: 'Texto obligatorio',
        inputPlaceholder: 'Motivo de baja del activo...',
        inputAttributes: {
          'aria-label': 'Texto obligatorio'
        },
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) {
            return 'El motivo de bajadel activo es obligatorio';
          }
          return undefined;
        }
      });
      if (inputValue) {
        this.loadingService.showLoading();
        let productoDarBaja = this.informacionProductoCustodio.producto;
        productoDarBaja!.estaActivo = false;
        productoDarBaja!.motivoBaja = inputValue;
        let mensajeBajaActivo = await this.productosService.darBajaProductoActivo(Number(productoDarBaja?.idProducto), productoDarBaja!);
        Swal.fire({
          text: mensajeBajaActivo,
          icon: 'success',
        }).then(() => {
          window.location.reload();
        });
      } else {
        this.toastrService.info("Baja de activo", "El usuario cancelo la operación.")
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al obtener los beneficios de los paquetes', error.message);
      } else {
        this.toastrService.error('Error al obtener los beneficios de los paquetes', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

}
