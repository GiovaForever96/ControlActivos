import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppComponent } from 'src/app/app.component';
import { IDetallePlanCuenta, IGastoPresupuesto, IHistorialGastoPresupuesto, IIndicadorFinanciero, IPlanCuentas, IPlanCuentasPresupuesto } from 'src/app/models/plan-cuentas';
import { IGastoMensual, IGastosRespuesta } from 'src/app/models/presupuesto-gastos';
import { IndicadorFinancieroService } from 'src/app/services/indicador-financiero.service';
import { LoadingService } from 'src/app/services/loading.service';
import { PlanCuentasService } from 'src/app/services/plan-cuentas.service';
import { PresupuestoGastoService } from 'src/app/services/presupuesto-gasto.service';
import { ToastrService } from 'src/app/services/toastr.service';
declare var $: any;
import * as XLSX from 'xlsx';
import * as SpanishLanguage from 'src/assets/Spanish.json';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.css']
})
export class ResultadosComponent {

  @ViewChild('dataTableHistorial', { static: false }) tableHistorial!: ElementRef;

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
  lstHistorial: IHistorialGastoPresupuesto[] = [];
  dtOptions: any;
  dataTable: any;
  lstDetallePlanCuenta: IDetallePlanCuenta[] = [];

  constructor(private planCuentasService: PlanCuentasService,
    private indicadoresService: IndicadorFinancieroService,
    private fb: FormBuilder,
    private el: ElementRef,
    private renderer: Renderer2,
    private presupuestoGastoService: PresupuestoGastoService,
    private toastr: ToastrService,
    private loadingService: LoadingService,
    private planCuentaService: PlanCuentasService,
    private appComponent: AppComponent) {
    this.lstMeses = appComponent.obtenerMesesAnio();
  }

  async ngOnInit() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Gastos Mensuales');
      this.lstAnios = await this.planCuentasService.obtenerAniosValidos();
      this.lstIndicadoresFinancieros = await this.indicadoresService.obtenerIndicadoresFinancieros(1);
      this.lstDetallePlanCuenta = await this.planCuentaService.obtenerDetallePlanCuenta();
      this.anioGasto = new Date().getFullYear();
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
  }

  async OnSubmit() {
    let esError = false;
    //Validamos la información
    if (this.nameFile == '') {
      this.toastr.error("Registro gastos", "No se ha seleccionado el archivo a cargar");
      return;
    }
    var existeIndicadoresVacios = this.lstIndicadoresFinancieros.filter(x => x.idPadre == 0 || x.idPadre == null).length > 0;
    if (existeIndicadoresVacios) {
      this.toastr.error("Registro gastos", "No se ha completado los indicadores.");
      return;
    }
    try {
      this.loadingService.showLoading();
      //Inserción de Gastos
      if (this.nameFile != '') {
        this.registrosExcel.forEach((element: any) => {
          let lstValores: number[] = [];
          this.lstMeses.forEach(mes => {
            // lstValores.push(element[mes.nombre] == '' ? 0 : element[mes.nombre]);
            if (element[mes.nombre] == '' || element[mes.nombre] == undefined) {
              lstValores.push(0);
            } else {
              lstValores.push(element[mes.nombre] ?? 0);
            }
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
        // let posicionValorGasto = this.obtenerUltimaPosicionValor(sumaMensualRegistro);
        var nombreUsuario = localStorage.getItem('userName') ?? '';
        let resultado = await this.presupuestoGastoService.agregarGastoAnual(this.mesGasto, nombreUsuario, this.lstPlanCuentasPresupuesto);
        if (!resultado.includes('Error:')) {
          this.toastr.success("Registro gastos", "Los gastos se han registrados correctamente");
        } else {
          this.toastr.error("Registro gastos", resultado);
          this.loadingService.hideLoading();
        }
      }
      //Inserción de indicador financiero
      if (!existeIndicadoresVacios) {
        if (this.esActualizacionIndicadores) {
          //Modificamos el registro de los valores de indicadores
          this.lstValoresIndicadoresFinancieros.forEach(valorIndicador => {
            valorIndicador.montoIndicador = this.lstIndicadoresFinancieros.find(x => x.idPlan == valorIndicador.idCuentaPlan)?.idPadre ?? 0,
              valorIndicador.planCuenta = undefined
          });
          let respuestaPeticion = await this.indicadoresService.actualizarValorIndicadoresFinancieros(this.lstValoresIndicadoresFinancieros);
          esError = false;
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
            esError = false;
            this.lstValoresIndicadoresFinancieros.push(valorIndicadorFinanciero);
          });
          let respuestaPeticion = await this.indicadoresService.agregarValorIndicadoresFinancieros(this.lstValoresIndicadoresFinancieros);
          setTimeout(() => { this.toastr.success("Guardado Exitosamente", respuestaPeticion); }, 1000);
        }
      }
    } catch (error) {
      esError = true;
      if (error instanceof Error) {
        this.toastr.error('Error al registrar gastos', error.message);
      } else {
        this.toastr.error('Error al registrar gastos', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
      if (!esError) {
        window.location.reload();
      }
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
        this.registrosExcel[index].Gasto = 0;
        // this.toastr.error('Valor Gasto Incorrecto', 'Revisar valor en: ' + this.registrosExcel[index].Nombre);
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
      this.lstHistorial = await this.presupuestoGastoService.obtenerHistorialGastoPresupuesto(this.anioGasto, 0);
      this.cabeceraMeses = registros.listaMesesGastos;
      this.listaDatos = registros.informacionGastoPresupuesto;
      //Calcular el próximo mes a ingresar
      if (registros.listaMesesGastos != undefined && registros.listaMesesGastos.length > 0) {
        const listaMesesGastos = registros.listaMesesGastos;
        const maxIdMes = listaMesesGastos.reduce((max, mes) =>
          Math.max(max, mes.idMes), 0 // Suponiendo que 0 es el valor mínimo posible
        );
        // Sumar 1 al máximo encontrado
        const nuevoIdMes = maxIdMes + 1;
        this.mesGasto = nuevoIdMes;
      } else {
        this.mesGasto = 1;
      }
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

    try {
      this.loadingService.showLoading();

      if (valorNuevo < 0) {
        this.toastr.warning("Valor incorrecto", "El valor ingresado no puede ser menor a 0");
        valorNuevo = this.valorOriginalEditar;
        return;
      }

      if (this.valorOriginalEditar === valorNuevo) {
        return;
      }

      const item: IGastoPresupuesto = {
        anioGastoPresupuesto: this.anioGasto,
        mesGastoPresupuesto: mes.idMes,
        idPlan: plan.idPlan,
        valorGastoMensual: valorNuevo,
        usuarioModificacion: localStorage.getItem('userName') ?? ''
      };

      await this.presupuestoGastoService.actualizarValorGastoPresupuesto(item, 0);
      this.onChangeAnio();
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al modificar el valor del gasto', error.message);
      } else {
        this.toastr.error('Error al modificar el valor del gasto', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
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

  visualizarHistorial(): void {
    try {
      this.loadingService.showLoading();
      $('#historialModal').modal('show');
      $('#historialModal').on('shown.bs.modal', async () => {
        this.dtOptions = {
          data: this.lstHistorial,
          info: false,
          language: {
            ...this.GetSpanishLanguage()
          },
          columns: [
            {
              title: 'Fecha Modificación',
              data: 'fechaModificacion',
              render: function (data: any, type: any, row: any) {
                if (data) {
                  const date = new Date(data);
                  return date.toLocaleString();  // Aquí puedes usar cualquier formato que desees
                }
                return '';
              }
            },
            { title: 'Usuario', data: 'usuario' },
            { title: 'Mes', data: 'mesModificacion' },
            { title: 'Código Cta.', data: 'codigoCuenta' },
            { title: 'Nombre Cta.', data: 'nombreCuenta' },
            {
              title: 'Valor anterior',
              data: 'montoAnterior',
              render: (data: any, type: any, full: any, meta: any) => {
                return this.appComponent.formatoDinero(full.montoAnterior, true);
              },
              className: 'text-right'
            },
            {
              title: 'Valor actual',
              data: 'montoActual',
              render: (data: any, type: any, full: any, meta: any) => {
                return this.appComponent.formatoDinero(full.montoActual, true);
              },
              className: 'text-right'
            },
            {
              title: 'Variación',
              data: 'variacionMonto',
              render: (data: any, type: any, full: any, meta: any) => {
                return this.appComponent.formatoDinero(full.variacionMonto, true);
              },
              className: 'text-right'
            },
          ],
          responsive: false,
          autoWidth: false,
          scrollX: true,
          paging: true,
          orderable: false,
          destroy: true
        };

        if ($.fn.DataTable.isDataTable(this.tableHistorial.nativeElement)) {
          $(this.tableHistorial.nativeElement).DataTable().destroy();
        }
        this.dataTable = $(this.tableHistorial.nativeElement).DataTable(this.dtOptions);

      });
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al cargar el historial', error.message);
      } else {
        this.toastr.error('Error al cargar el historial', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  GetSpanishLanguage() {
    return SpanishLanguage;
  }

  obtenerInformacion(idPlan: any, mes: any): string | undefined {
    let mensajeTooltip: string = "Información:\n";
    let detalleCuenta = this.lstDetallePlanCuenta.filter(x => x.planCuenta!.idPlan == idPlan &&
      x.mes == mes &&
      x.anio == this.anioGasto);
    if (detalleCuenta.length > 0) {
      detalleCuenta.forEach(x => {
        mensajeTooltip += `${x.descripcionDetalle}: ${this.appComponent.formatoDinero(x.montoDetalle, true)}\n`;
      });
      return mensajeTooltip;
    }
    return undefined;
  }

  tieneDetallePlan(idPlan: number, idMes: any) {
    let detallePlanCuenta = this.lstDetallePlanCuenta.filter(x => x.planCuenta.idPlan == idPlan && x.mes == idMes && x.anio == this.anioGasto);
    return detallePlanCuenta.length <= 1;
  }

  getTotal(month: string, type: string): number {
    return this.filteredData.reduce((acc, plan) => {
      const key = month + (type === 'gastos' ? 'G' : '');
      const valor = Number(plan.mesGastoPresupuesto[key]) || 0;

      if (plan.codigoPlan === '4.') {
        return acc + valor; // Suma los valores del plan 4.
      } else if (plan.codigoPlan === '5.') {
        return acc - valor; // Resta los valores del plan 5.
      }

      return acc; // Si no es ni 4. ni 5., no hace nada.
    }, 0);
  }


  getTotalDiferencia(month: string): number {
    return this.getTotal(month, 'presupuesto') - this.getTotal(month, 'gastos');
  }

  getTotalPorcentaje(month: string): number {
    const presupuesto = this.getTotal(month, 'presupuesto');
    const gastos = this.getTotal(month, 'gastos');
    return presupuesto > 0 ? (gastos / presupuesto) : 0;
  }

}
