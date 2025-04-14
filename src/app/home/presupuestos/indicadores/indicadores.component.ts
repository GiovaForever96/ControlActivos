import { Component, ElementRef, Renderer2 } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { IIndicadoresFinancierosCalculos, IPlanCuentas } from 'src/app/models/plan-cuentas';
import { IGastosRespuesta } from 'src/app/models/presupuesto-gastos';
import { DataService } from 'src/app/services/data.service';
import { IndicadorFinancieroService } from 'src/app/services/indicador-financiero.service';
import { LoadingService } from 'src/app/services/loading.service';
import { PlanCuentasService } from 'src/app/services/plan-cuentas.service';
import { ToastrService } from 'src/app/services/toastr.service';
declare var $: any;
declare var pdfMake: any;

@Component({
  selector: 'app-indicadores',
  templateUrl: './indicadores.component.html',
  styleUrls: ['./indicadores.component.css']
})
export class IndicadoresComponent {

  //#region 
  anioIndicador: any = 2024;
  mesIndicador: any = "";
  lstPlanCuentas: (IPlanCuentas & Record<string, any>)[] = [];
  lstIndicadoresFinancieros: IPlanCuentas[] = [];
  lstMeses: any[] = [];
  cabeceraMeses: any[] = [];
  lstAnios: any[] = [];
  filterText: string = '';
  listaDatos: any[] = [];
  lstRoles: string[] = [];
  lstIndicadoresPorcentaje: string[] = ['15.', '16.', '17.', '18.', '20.'];
  informacionIndicadoresFinancieros: any;
  informacionIndicadoresFinancierosReporte: any;
  indicadoresFinancierosCalculos: IIndicadoresFinancierosCalculos = null!;
  base64Image = 'data:image/png;base64,<TU_BASE64_AQUÍ>';

  //#endregion

  constructor(
    private loadingService: LoadingService,
    private toastr: ToastrService,
    private el: ElementRef,
    private renderer: Renderer2,
    private planCuentasService: PlanCuentasService,
    private indicadoresService: IndicadorFinancieroService,
    private dataService: DataService,
    private appComponent: AppComponent) {
    this.lstMeses = appComponent.obtenerMesesAnio();
  }

  async ngOnInit() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Indicadores Financieros');
      this.lstAnios = await this.planCuentasService.obtenerAniosValidos();
      this.anioIndicador = new Date().getFullYear();
      const body = this.el.nativeElement.ownerDocument.body;
      this.renderer.setStyle(body, 'overflow', '');
      this.lstRoles = localStorage.getItem('roles')?.split(',') ?? [];
      this.base64Image = await this.imageToBase64String("https://cotizador.segurossuarez.com/backend/public/img/EncabezadoIndicadores.jpg");
      const storedData = localStorage.getItem("indicadoresFinancieros");
      this.indicadoresFinancierosCalculos = storedData
        ? (JSON.parse(storedData) as IIndicadoresFinancierosCalculos)
        : null!;
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error Indicadores Financieros', error.message);
      } else {
        this.toastr.error('Error Indicadores Financieros', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.onChangeAnio();
    }
  }

  async onChangeAnio() {
    try {
      this.loadingService.showLoading();
      this.lstPlanCuentas = await this.indicadoresService.obtenerIndicadoresFinancieros(0);
      this.cabeceraMeses = [];
      this.listaDatos = [];
      let registros: IGastosRespuesta = await this.indicadoresService.obtenerValorIndicadorFinanciero(this.anioIndicador);
      this.cabeceraMeses = registros.listaMesesGastos;
      this.listaDatos = registros.informacionGastoPresupuesto;
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error Indicadores Financieros', error.message);
      } else {
        this.toastr.error('Error Indicadores Financieros', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 3000);
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

  visualizarDocumento(nombreMes: any) {
    if (this.indicadoresFinancierosCalculos == null) {
      this.toastr.warning("Indicadores Financieros", "No se encontró los códigos de los indicadores financieros");
      return;
    }
    this.mesIndicador = nombreMes;
    //Obtener los valores para las tablas
    var activoCorriente = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.ActivoCorriente, nombreMes);
    var pasivoCorriente = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.PasivoCorriente, nombreMes);
    var indiceLiquidez = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.Liquidez, nombreMes);
    var indicePruebaAcida = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.Liquidez, nombreMes);
    var utilidadNeta = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.UtilidadNeta, nombreMes);
    var activosTotal = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.ActivoTotal, nombreMes);
    var ROA = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.RentabilidadROA, nombreMes) * 100;
    var patrimonio = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.Patrimonio, nombreMes);
    var ROE = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.RentabiidadROE, nombreMes) * 100;
    var utilidadBruta = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.UtilidadBruta, nombreMes);
    var ventas = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.Ventas, nombreMes);
    var margenBruto = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.MargenBrutoUtilidad, nombreMes) * 100;
    var margenNeto = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.MargenNetoUtilidad, nombreMes) * 100;
    var capitalTrabajo = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.CapitalTrabajoNeto, nombreMes);
    var pasivoTotal = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.PasivoTotal, nombreMes);
    var apalancamientoTotal = this.obtenerValorIndicador(this.indicadoresFinancierosCalculos.ApalancamientoTotal, nombreMes) * 100;
    this.informacionIndicadoresFinancieros = [
      {
        headers: ['DESCRIPCION', 'ACTIVO CORRIENTE', 'PASIVO CORRIENTE', 'VALOR INDICE'],
        rows: [
          [
            'Índice de Liquidez en detalle: Activo Corriente / Pasivo Corriente',
            this.appComponent.formatoDinero(activoCorriente, true),
            this.appComponent.formatoDinero(pasivoCorriente, true),
            this.appComponent.formatoDinero(indiceLiquidez, true)
          ]
        ],
        editableResumen: null
      },
      {
        headers: ['DESCRIPCION', 'ACTIVO CORRIENTE', 'PASIVO CORRIENTE', 'VALOR INDICE'],
        rows: [
          ['Índice de Prueba ácida en detalle: (Activo corriente - Inventario) / Pasivo Corriente',
            this.appComponent.formatoDinero(activoCorriente, true),
            this.appComponent.formatoDinero(pasivoCorriente, true),
            this.appComponent.formatoDinero(indicePruebaAcida, true)
          ]
        ],
        editableResumen: `El índice corriente o de liquidez fue ${this.appComponent.formatoDinero(indiceLiquidez, true)}.El factor mínimo de este es 1,0 y el óptimo de 2,5`
      },
      {
        headers: ['DESCRIPCION', 'UTILIDAD NETA', 'ACTIVOS TOTALES', 'VALOR INDICE'],
        rows: [
          ['ROA o Retorno sobre los activos en detalle: Utilidad Neta (Utilidad - 25% impto - 15% trab) / Activos Totales',
            this.appComponent.formatoDinero(utilidadNeta, true),
            this.appComponent.formatoDinero(activosTotal, true),
            `${this.appComponent.formatoDinero(ROA, false)}%`
          ]
        ],
        editableResumen: `La compañía tiene un Rendimiento respecto de sus activos totales de ${this.appComponent.formatoDinero(ROA, false)}%`
      },
      {
        headers: ['DESCRIPCION', 'UTILIDAD NETA', 'PATRIMONIO', 'VALOR INDICE'],
        rows: [
          ['ROE o retorno sobre el Capital Propio en detalle: Utilidad Neta (Utilidad -25% impto -15% trab) /Patrimonio Total',
            this.appComponent.formatoDinero(utilidadNeta, true),
            this.appComponent.formatoDinero(patrimonio, true),
            `${this.appComponent.formatoDinero(ROE, false)}%`
          ]
        ],
        editableResumen: `El patrimonio obtuvo una rentabilidad de ${this.appComponent.formatoDinero(ROE, false)}%`
      },
      {
        headers: ['DESCRIPCION', 'UTILIDAD BRUTA', 'VENTAS', 'VALOR INDICE'],
        rows: [
          ['MARGEN BRUTO de UTILIDAD en detalle: Utilidad del Ejercicio / Ventas',
            this.appComponent.formatoDinero(utilidadBruta, true),
            this.appComponent.formatoDinero(ventas, true),
            `${this.appComponent.formatoDinero(margenBruto, false)}%`
          ]
        ],
        editableResumen: `El Margen Neto de Utilidad, (La Rentabilidad de la empresa en relación a sus Ventas) con frecuencia es el índice de mayor consulta a la hora de evaluar a la compañía, este es de ${this.appComponent.formatoDinero(margenBruto, false)}%, una vez restados los costos, gastos, participación trabajadores e impuesto renta, es decir por cada dólar que la empresa vendió gano para los socios $ __ .`
      },
      {
        headers: ['DESCRIPCION', 'UTILIDAD NETA', 'VENTAS', 'VALOR INDICE'],
        rows: [
          ['MARGEN NETO de UTILIDAD en detalle: Utilidad Neta (Utilidad -25% impto -15% trab) / Ventas',
            this.appComponent.formatoDinero(utilidadNeta, true),
            this.appComponent.formatoDinero(ventas, true),
            `${this.appComponent.formatoDinero(margenNeto, false)}%`
          ]
        ],
        editableResumen: `El Margen Bruto de Utilidad de la compañía alcanza el ${this.appComponent.formatoDinero(margenNeto, false)}%, considérese que se encuentran deducidos los gastos de ventas, administrativos y financieros.`
      },
      {
        headers: ['DESCRIPCION', 'ACTIVO CORRIENTE', 'PASIVO CORRIENTE', 'VALOR INDICE'],
        rows: [
          ['CAPITAL DE TRABAJO NETO ACTIVO CORRIENTE - PASIVO CORRIENTE',
            this.appComponent.formatoDinero(activoCorriente, true),
            this.appComponent.formatoDinero(pasivoCorriente, true),
            this.appComponent.formatoDinero(capitalTrabajo, true)
          ]
        ],
        editableResumen: `El capital de trabajo ${this.appComponent.formatoDinero(capitalTrabajo, true)} no es una razón. Permite determinar la disponibilidad de dinero para adelantar las operaciones del negocio en los meses siguientes, además que muestra la capacidad para enfrentar los pasivos corrientes clasificados así en el balance.`
      },
      {
        headers: ['DESCRIPCION', 'ACTIVO TOTAL', 'PASIVO TOTAL', 'VALOR INDICE'],
        rows: [
          ['APALANCAMIENTO TOTAL PASIVO TOTAL/ACTIVO TOTAL',
            this.appComponent.formatoDinero(activosTotal, true),
            this.appComponent.formatoDinero(pasivoTotal, true),
            `${this.appComponent.formatoDinero(apalancamientoTotal, false)}%`
          ]
        ],
        editableResumen: `El índice de Endeudamiento indica que los activos han sido financiados a través de deudas en el ${this.appComponent.formatoDinero(apalancamientoTotal, false)}%, o visto de otra manera los socios son propietarios del ${this.appComponent.formatoDinero(apalancamientoTotal, false)}% de la compañía.`
      }
    ];
    $('#indicadoresModal').modal('show');
  }

  obtenerValorIndicador(idPlan: number, nombreMes: string): number {
    let registroCuentaPlan = this.listaDatos.find(x => x.idPlan == idPlan);
    let valorIndicador: number = 0;
    if (registroCuentaPlan != null && registroCuentaPlan != undefined) {
      valorIndicador = registroCuentaPlan.mesGastoPresupuesto[nombreMes];
    }
    return valorIndicador;
  }


  generarInformePdf() {
    const documentDefinition: any = {
      background: [
        {
          image: this.base64Image,
          width: 600,
          absolutePosition: { x: 0, y: 0 },
          opacity: 1,
        }
      ],
      pageMargins: [50, 165, 50, 75],
      content: [
        {
          text: 'ÍNDICES FINANCIEROS ' + this.mesIndicador + '/' + this.anioIndicador,
          fontSize: 11,
          style: 'title',
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        {
          text: 'SEGUSUAREZ AGENCIA ASESORA PRODUCTORA DE SEGUROS CIA. LTDA.',
          fontSize: 10,
          style: 'subtitle',
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
      ],
      styles: {
        header: {
          fontSize: 9,
          bold: true,
          alignment: 'center',
          margin: [0, 5, 0, 5],
          lineHeight: 1,
        },
        table: {
          margin: [0, 5, 0, 5],
          fontSize: 9,
          border: [true, true, true, true],
          lineHeight: 1,
        },
        tableHeader: {
          fillColor: '#cfe2f3',
          alignment: 'center',
          fontSize: 9,
          bold: true,
          border: [true, true, true, true],
          margin: [0, 2, 0, 2],
          lineHeight: 1,
        },
        tableCell: {
          alignment: 'center',
          fontSize: 9,
          border: [true, true, true, true],
          margin: [0, 2, 0, 2],
          lineHeight: 1,
        },
        editableResumen: {
          fontSize: 9,
          margin: [0, 5, 0, 10],
          lineHeight: 1,
        },
        firmaInfo: {
          fontSize: 9,
          alignment: 'center',
          margin: [0, 10, 0, 10],
          lineHeight: 1,
        }
      }
    };

    this.informacionIndicadoresFinancieros.forEach((indicador: any) => {
      const table = {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', '*'],
          body: [
            indicador.headers.map((header: any) => ({
              text: header,
              style: 'tableHeader'
            })),
            ...indicador.rows.map((row: any) =>
              row.map((cell: any) => ({
                text: cell,
                style: 'tableCell'
              }))
            )
          ]
        },
        style: 'table'
      };

      documentDefinition.content.push(table);

      if (indicador.editableResumen) {
        documentDefinition.content.push({
          text: [
            { text: 'Resumen: ', bold: true },
            indicador.editableResumen
          ],
          style: 'editableResumen'
        });
      }
    });

    documentDefinition.content.push({
      columns: [
        {
          text: '\n\n\n\n\n----------------------------------------------------------------------\nIng. José Miguel Suárez Mantilla\nGerente General',
          style: 'firmaInfo',
          width: '50%'
        },
        {
          text: '\n\n\n\n\n----------------------------------------------------------------------\nIng. Enma Jeannette Gavilanes Valverde\nContadora',
          style: 'firmaInfo',
          width: '50%'
        }
      ],
      columnGap: 10
    });

    pdfMake.createPdf(documentDefinition).open();
  }


  async imageToBase64String(imageUrl: string): Promise<string> {
    const proxyUrl = 'https://cotizador.segurossuarez.com/backend/public/api/proxy-image?url=' + encodeURIComponent(imageUrl);
    try {
      const base64 = await this.dataService.getImage(proxyUrl);
      return base64;
    } catch (error: any) {
      this.toastr.error('Error al cargar la imagen:', error);
      return '';
    }
  }

}
