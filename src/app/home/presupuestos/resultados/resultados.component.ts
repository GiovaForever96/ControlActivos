import { Component, ElementRef, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppComponent } from 'src/app/app.component';
import { IGastoPresupuesto, IIndicadorFinanciero, IPlanCuentas, IPlanCuentasPresupuesto } from 'src/app/models/plan-cuentas';
import { IGastoMensual, IGastosRespuesta } from 'src/app/models/presupuesto-gastos';
import { IndicadorFinancieroService } from 'src/app/services/indicador-financiero.service';
import { LoadingService } from 'src/app/services/loading.service';
import { PlanCuentasService } from 'src/app/services/plan-cuentas.service';
import { PresupuestoGastoService } from 'src/app/services/presupuesto-gasto.service';
import { ToastrService } from 'src/app/services/toastr.service';
declare var $: any;
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.css']
})
export class ResultadosComponent {

  //Variables
  anioGasto: any = 2024;
  lstPlanCuentas: (IPlanCuentas & Record<string, any>)[] = [];
  lstMeses: any[] = [];
  lstPlanCuentasPresupuesto: IPlanCuentasPresupuesto[] = [];
  filterText: string = '';
  file: any;
  cabeceraMeses: any[] = [];
  listaDatos: any[] = [];
  nameFile: string = '';
  arrayBuffer: any;
  registrosExcel: any;
  registrosExcelAuxiliar: any;
  valorOriginalEditar: number = 0;
  lstAnios: any[] = [];
  lstRoles: string[] = [];
  lstIndicadoresFinancieros: IPlanCuentas[] = [];
  lstValoresIndicadoresFinancieros: IIndicadorFinanciero[] = [];
  mesGasto: number = 0;
  esActualizacionIndicadores: boolean = false;

  constructor(private planCuentasService: PlanCuentasService,
    private indicadoresService: IndicadorFinancieroService,
    private fb: FormBuilder,
    private el: ElementRef,
    private renderer: Renderer2,
    private presupuestoGastoService: PresupuestoGastoService,
    private toastr: ToastrService,
    private loadingService: LoadingService,
    private appComponent: AppComponent) {
    this.lstMeses = appComponent.obtenerMesesAnio();
  }

  async ngOnInit() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Gastos Mensuales');
      this.lstAnios = await this.planCuentasService.obtenerAniosValidos();
      this.lstIndicadoresFinancieros = await this.indicadoresService.obtenerIndicadoresFinancieros(1);
      this.anioGasto = new Date().getFullYear();
      const body = this.el.nativeElement.ownerDocument.body;
      this.renderer.setStyle(body, 'overflow', '');
      this.lstRoles = localStorage.getItem('roles')?.split(',') ?? [];
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al obtener el presupuesto', error.message);
      } else {
        this.toastr.error('Error al obtener el presupuesto', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.onChangeAnio();
    }
  }

  get filteredData() {
    if (this.listaDatos) {
      return this.listaDatos.filter(plan =>
        plan.codigoPlan?.toLowerCase().includes(this.filterText.toLowerCase()) ||
        plan.nombrePlan.toLowerCase().includes(this.filterText.toLowerCase())
      );
    } else {
      return [];
    }

  }

  async abrirModal() {
    $('#planModal').modal('show');
    this.mesGasto = 0;
  }

  async OnSubmit() {
    try {
      this.loadingService.showLoading();
      //Inserción de Gastos
      if (this.nameFile != '') {
        this.registrosExcel.forEach((element: any) => {
          let lstValores: number[] = [];
          this.lstMeses.forEach(mes => {
            lstValores.push(element[mes.nombre] == '' ? 0 : element[mes.nombre]);
          });
          let item: IPlanCuentasPresupuesto = {
            anioPresupuesto: Number(this.anioGasto),
            idPlan: element.Id,
            valorPresupuestoMensual: lstValores
          };
          this.lstPlanCuentasPresupuesto.push(item);
        });
        // Obtener la longitud máxima de las listas internas
        let maxLength = Math.max(...this.lstPlanCuentasPresupuesto.map(item => item.valorPresupuestoMensual.length));
        // Crear una nueva lista con las sumas por posición
        let sumaMensualRegistro = Array.from({ length: maxLength }, (_, index) => {
          return this.lstPlanCuentasPresupuesto.reduce((sum, item) => sum + (item.valorPresupuestoMensual[index] || 0), 0);
        });
        let posicionValorGasto = this.obtenerUltimaPosicionValor(sumaMensualRegistro);
        await this.presupuestoGastoService.agregarGastoAnual(posicionValorGasto + 1, this.lstPlanCuentasPresupuesto);
        this.toastr.success("Registro gastos", "Los gastos se han registrados correctamente");
      }
      //Inserción de indicador financiero
      var registroModificados = this.lstIndicadoresFinancieros.filter(x => x.idPadre == 0 || x.idPadre == null).length;
      if (registroModificados != this.lstIndicadoresFinancieros.length) {
        if (this.esActualizacionIndicadores) {
          //Modificamos el registro de los valores de indicadores
          this.lstValoresIndicadoresFinancieros.forEach(valorIndicador => {
            valorIndicador.montoIndicador = this.lstIndicadoresFinancieros.find(x => x.idPlan == valorIndicador.idCuentaPlan)?.idPadre ?? 0,
              valorIndicador.planCuenta = undefined
          });
          let respuestaPeticion = await this.indicadoresService.actualizarValorIndicadoresFinancieros(this.lstValoresIndicadoresFinancieros);
          setTimeout(() => { this.toastr.success("Guardado Exitosamente", respuestaPeticion); }, 1000);
        } else {
          this.lstValoresIndicadoresFinancieros = [];
          this.lstIndicadoresFinancieros.forEach(indicadorFinanciero => {
            var valorIndicadorFinanciero: IIndicadorFinanciero = {
              idIndicadorFinanciero: 0,
              anioIndicador: this.anioGasto,
              mesIndicador: this.mesGasto,
              montoIndicador: indicadorFinanciero?.idPadre ?? 0,
              idCuentaPlan: indicadorFinanciero.idPlan,
              planCuenta: undefined
            };
            this.lstValoresIndicadoresFinancieros.push(valorIndicadorFinanciero);
          });
          let respuestaPeticion = await this.indicadoresService.agregarValorIndicadoresFinancieros(this.lstValoresIndicadoresFinancieros);
          setTimeout(() => { this.toastr.success("Guardado Exitosamente", respuestaPeticion); }, 1000);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al registrar gastos', error.message);
      } else {
        this.toastr.error('Error al registrar gastos', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      window.location.reload();
    }
  }

  validarExcel() {
    let headers: any[] = [];
    let arraylistAux = this.registrosExcelAuxiliar;
    headers = arraylistAux[0] as string[];
    let camposObligatorios = ['Id', 'Codigo', 'Nombre'];
    camposObligatorios.forEach(element => {
      let encontro = headers.find((item) => item == element);
      if (!encontro) {
        this.toastr.error('Columna Faltante', 'El formato debe contener la columna ' + element);
        return;
      }
    });
    for (let index = 0; index < this.registrosExcel.length; index++) {
      if (isNaN(Number(this.registrosExcel[index].Gasto)) || String(this.registrosExcel[index].Gasto).trim() == '') {
        this.toastr.error('Valor Gasto Incorrecto', 'Revisar valor en: ' + this.registrosExcel[index].Nombre);
        break;
      }
    }
  }

  descargarFormato() {
    let listaPlanes: any[] = [];
    this.lstPlanCuentas.forEach(element => {
      let item: any = {
        Id: element.idPlan,
        Codigo: element.codigoPlan,
        Nombre: element.nombrePlan,
      };
      this.lstMeses.forEach(mes => {
        item[mes.nombre] = '';
      });
      listaPlanes.push(item);
    });
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(listaPlanes);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'formato');
    XLSX.writeFile(wb, 'formatoGastos.xlsx');
  }

  async onChangeAnio() {
    try {
      this.loadingService.showLoading();
      this.lstPlanCuentas = await this.planCuentasService.obtenerPlanCuentas();
      this.cabeceraMeses = [];
      this.listaDatos = [];
      let registros: IGastosRespuesta = await this.presupuestoGastoService.obtenerGastosPresupuestoPlanCuenta(this.anioGasto);
      this.cabeceraMeses = registros.listaMesesGastos;
      this.listaDatos = registros.informacionGastoPresupuesto;
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al obtener el presupuesto', error.message);
      } else {
        this.toastr.error('Error al obtener el presupuesto', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 3000);
    }
  }

  async onFileChange(event: any) {
    this.loadingService.showLoading();
    setTimeout(() => {
      let file = event.target.files[0];
      if (file) {
        this.nameFile = file.name;
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = (e) => {
          this.arrayBuffer = fileReader.result;
          var data = new Uint8Array(this.arrayBuffer);
          var arr = new Array();
          for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
          var bstr = arr.join("");
          var workbook = XLSX.read(bstr, {
            type: "binary",
            cellDates: true,
            cellNF: false,
            cellText: false
          });
          var first_sheet_name = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[first_sheet_name];
          var arraylist = XLSX.utils.sheet_to_json(worksheet, { raw: true });
          this.registrosExcelAuxiliar = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          this.registrosExcel = arraylist;
        }
      }
      this.loadingService.hideLoading();

    }, 500);
  }

  async celdaEditada(plan: any, mes: any, valorNuevo: number) {
    if (valorNuevo < 0) {
      this.toastr.warning("Valor incorrecto", "El valor ingresado no puede ser menor a 0");
      valorNuevo = this.valorOriginalEditar;
      return;
    }

    if (this.valorOriginalEditar === valorNuevo) {
      return;
    }

    const item: IGastoPresupuesto = {
      anioGastoPresupuesto: plan.anioPresupuesto,
      mesGastoPresupuesto: mes.id,
      idPlan: plan.idPlan,
      valorGastoMensual: valorNuevo
    };

    await this.presupuestoGastoService.actualizarValorGastoPresupuesto(item, 1);
    this.onChangeAnio();
  }

  async onChangeMesIndicador() {
    try {
      this.loadingService.showLoading();
      if (this.mesGasto != 0) {
        this.lstValoresIndicadoresFinancieros = await this.indicadoresService.obtenerValorIndicadoresFinancieros(this.anioGasto, this.mesGasto) ?? [];
        this.esActualizacionIndicadores = this.lstValoresIndicadoresFinancieros.length > 0;
        // Mapea los valores obtenidos a `lstIndicadoresFinancieros`.
        this.lstIndicadoresFinancieros.forEach(item => {
          const indicadorEncontrado = this.lstValoresIndicadoresFinancieros.find(valor => valor.idCuentaPlan === item.idPlan);
          item.idPadre = indicadorEncontrado != undefined ? indicadorEncontrado.montoIndicador : 0;
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al obtener los indicadores financieros', error.message);
      } else {
        this.toastr.error('Error al obtener los indicadores financieros', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  celdaOriginal(valorOriginal: number) {
    this.valorOriginalEditar = valorOriginal;
  }

  permiteModificarRol(lstRolesPermitidos: string[]): boolean {
    return this.lstRoles.some(role => lstRolesPermitidos.includes(role));
  }

  obtenerUltimaPosicionValor(lstValores: number[]): number {
    // Inicializamos la variable para la última posición
    let ultimaPosicion = -1;
    // Recorremos el array de atrás hacia adelante
    for (let i = lstValores.length - 1; i >= 0; i--) {
      if (lstValores[i] !== 0) {
        ultimaPosicion = i;
        break;
      }
    }
    return ultimaPosicion;
  }

}
