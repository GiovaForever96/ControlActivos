import { Component, ElementRef, Renderer2 } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { IPlanCuentas } from 'src/app/models/plan-cuentas';
import { IGastosRespuesta } from 'src/app/models/presupuesto-gastos';
import { LoadingService } from 'src/app/services/loading.service';
import { PlanCuentasService } from 'src/app/services/plan-cuentas.service';
import { PresupuestoGastoService } from 'src/app/services/presupuesto-gasto.service';
import { ToastrService } from 'src/app/services/toastr.service';
declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  //#region Variables
  anioDashBoard: any = 2024;
  anioDashBoard2: any = 2024;
  mesDashBoard2: any = 1;
  lstAnios: any[] = [];
  informacionGastosPresupuesto: IGastosRespuesta = null!;
  lstPlanCuentas: IPlanCuentas[] = [];
  idCuentaSeleccionada: number = 0;
  nombreCuentaSeleccionada: string = '';
  visualizarSugerencias = false;
  listaCuentasPlan: KeyValue[] = [];
  listaFiltradaCuentasPlan: KeyValue[] = [];
  chart: any;
  chart2: any;
  lstPlanCuentasDB2: IPlanCuentas[] = [];
  idCuentaSeleccionadaDB2: number = 0;
  nombreCuentaSeleccionadaDB2: string = '';
  visualizarSugerenciasDB2 = false;
  listaCuentasPlanDB2: KeyValue[] = [];
  listaFiltradaCuentasPlanDB2: KeyValue[] = [];
  chartGasto: any;
  chartPresupuesto: any;
  lstMeses: any = [];
  //#endregion

  constructor(
    private loadingService: LoadingService,
    private appComponent: AppComponent,
    private el: ElementRef,
    private renderer: Renderer2,
    private presupuestoGastoService: PresupuestoGastoService,
    private planCuentasService: PlanCuentasService,
    private toastr: ToastrService) { }

  async ngOnInit() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('DashBoard');
      this.lstAnios = await this.planCuentasService.obtenerAniosValidos();
      this.anioDashBoard = new Date().getFullYear();
      this.anioDashBoard2 = new Date().getFullYear();
      const body = this.el.nativeElement.ownerDocument.body;
      this.renderer.setStyle(body, 'overflow', '');
      this.lstPlanCuentas = await this.planCuentasService.obtenerPlanCuentas();
      this.lstPlanCuentasDB2 = JSON.parse(JSON.stringify(this.lstPlanCuentas.filter(x => x.tieneHijos)));
      //Generar el listado para el autocomplete
      if (this.lstPlanCuentas !== null) {
        if (this.lstPlanCuentas.length > 0) {
          this.lstPlanCuentas.forEach(element => {
            this.listaCuentasPlan.push({ key: element.idPlan, value: `${element.codigoPlan} ${element.nombrePlan}` });
          });
          this.nombreCuentaSeleccionada = this.listaCuentasPlan[0].value;
          this.idCuentaSeleccionada = this.listaCuentasPlan[0].key;
        }
      }
      //Generar el listado para el autocomplete
      if (this.lstPlanCuentasDB2 !== null) {
        if (this.lstPlanCuentasDB2.length > 0) {
          this.lstPlanCuentasDB2.forEach(element => {
            this.listaCuentasPlanDB2.push({ key: element.idPlan, value: `${element.codigoPlan} ${element.nombrePlan}` });
          });
          this.nombreCuentaSeleccionadaDB2 = this.listaCuentasPlan[0].value;
          this.idCuentaSeleccionadaDB2 = this.listaCuentasPlan[0].key;
        }
      }
      this.lstMeses = this.appComponent.obtenerMesesAnio();
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error Indicadores Financieros', error.message);
      } else {
        this.toastr.error('Error Indicadores Financieros', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.onChangeAnio();
      this.onChangeAnioDash2();
    }
  }

  async onChangeAnio() {
    try {
      this.loadingService.showLoading();
      this.GenerarGraficaGastosPresupuestos();
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error Generación DashBoard', error.message);
      } else {
        this.toastr.error('Error Generación DashBoard', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 3000);
    }
  }

  async GenerarGraficaGastosPresupuestos() {
    try {

      this.loadingService.showLoading();

      // Obtener la información de la API
      var informacionGastoPresupuesto = await this.presupuestoGastoService.obtenerGastoPresupuestoCuentaGrafico(this.anioDashBoard, this.idCuentaSeleccionada);

      // Obtener referencias a los canvas
      const ctx = document.getElementById('graficoGastosPresupuestosCuenta') as HTMLCanvasElement;
      const ctx2 = document.getElementById('graficoGastosPresupuestosCuenta2') as HTMLCanvasElement;

      if (!ctx || !ctx2) {
        console.error("No se encontraron los elementos canvas.");
        return;
      }

      // Destruir gráficos anteriores si existen
      if (this.chart) this.chart.destroy();
      if (this.chart2) this.chart2.destroy();

      // Crear el gráfico
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.lstMeses.map((x: any) => x.nombre),
          datasets: [
            {
              label: 'Gastos',
              type: 'line',
              data: informacionGastoPresupuesto.informacionGastosIngresados,
              borderColor: '#1ABC9C',
              borderWidth: 3,
              backgroundColor: 'transparent',
              tension: 0.4,
              pointBackgroundColor: '#1ABC9C',
              pointBorderColor: '#FFFFFF',
              pointRadius: 5,
              pointBorderWidth: 2,
            },
            {
              label: 'Presupuesto',
              type: 'bar',
              data: informacionGastoPresupuesto.informacionPresupuestoIngresados,
              backgroundColor: '#3498DB',
              borderColor: '#2980B9',
              borderWidth: 1.5,
              barPercentage: 0.6,
            }
          ],
          options: {
            plugins: {
              legend: {
                labels: {
                  color: '#2C3E50',
                  font: {
                    size: 14,
                    weight: 'bold',
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: '#2C3E50',
                },
              },
              y: {
                ticks: {
                  color: '#2C3E50',
                },
                beginAtZero: true,
              },
            },
          }
        },
        options: {
          responsive: true,
          scales: {
            x: {
              beginAtZero: true
            },
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleColor: 'white',
              bodyColor: 'white',
            },
            legend: {
              display: true
            }
          }
        }
      });

      // Segundo gráfico (usando ctx2)
      this.chart2 = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: this.appComponent.obtenerMesesAnio().map((x: any) => x.nombre),
          datasets: [
            {
              label: 'Gastos',
              type: 'line',
              data: informacionGastoPresupuesto.informacionGastosIngresados,
              borderColor: '#1ABC9C',
              borderWidth: 3,
              backgroundColor: 'rgba(26, 188, 156, 0.2)',
              fill: true,
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: 'Presupuesto',
              type: 'line',
              data: informacionGastoPresupuesto.informacionPresupuestoIngresados,
              borderColor: '#9B59B6',
              borderWidth: 3,
              backgroundColor: 'rgba(155, 89, 182, 0.2)',
              fill: true,
              tension: 0.4,
              pointRadius: 0,
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              beginAtZero: true
            },
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleColor: 'white',
              bodyColor: 'white',
            },
            legend: {
              display: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error Generación DashBoard', error.message);
      } else {
        this.toastr.error('Error Generación DashBoard', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  onFocus(event: any) {
    this.listaFiltradaCuentasPlan = this.listaCuentasPlan;
    this.visualizarSugerencias = true;
  }

  onInputChange(event: any) {
    const value = event.target.value.toLowerCase();
    this.listaFiltradaCuentasPlan = this.listaCuentasPlan.filter(suggestion =>
      suggestion.value.toLowerCase().includes(value.toLowerCase())
    );
  }

  onSuggestionClick(suggestion: any) {
    this.idCuentaSeleccionada = suggestion.key;
    this.nombreCuentaSeleccionada = suggestion.value;
    this.visualizarSugerencias = false;
    this.GenerarGraficaGastosPresupuestos();
  }

  onBlur() {
    setTimeout(() => {
      this.visualizarSugerencias = false;
    }, 200);
  }

  handleKeyDown(event: KeyboardEvent) { }

  async onChangeAnioDash2() {
    try {
      this.loadingService.showLoading();
      this.GenerarGraficasPastel();
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error Generación DashBoard', error.message);
      } else {
        this.toastr.error('Error Generación DashBoard', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 3000);
    }
  }

  async onChangeMes() {
    try {
      this.loadingService.showLoading();
      this.GenerarGraficasPastel();
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error Generación DashBoard', error.message);
      } else {
        this.toastr.error('Error Generación DashBoard', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 3000);
    }
  }

  async GenerarGraficasPastel() {

    try {

      this.loadingService.showLoading();

      // Obtener la información de la API
      var informacionGastoPresupuestoMes = await this.presupuestoGastoService.obtenerGastoPresupuestoMesCuentaGrafico(this.anioDashBoard2,
        this.mesDashBoard2,
        this.idCuentaSeleccionadaDB2);

      // Obtener referencias a los canvas
      const ctx = document.getElementById('doughnutChartPresupuestos') as HTMLCanvasElement;
      const ctx2 = document.getElementById('doughnutChartGastos') as HTMLCanvasElement;

      if (!ctx || !ctx2) {
        console.error("No se encontraron los elementos canvas.");
        return;
      }

      // Destruir gráficos anteriores si existen
      if (this.chartGasto) this.chartGasto.destroy();
      if (this.chartPresupuesto) this.chartPresupuesto.destroy();


      var listadoColores = this.generateColors(informacionGastoPresupuestoMes.informacionCuentas.length);

      this.chartPresupuesto = new Chart(ctx, {
        type: 'doughnut', // Tipo de gráfico Doughnut
        data: {
          labels: informacionGastoPresupuestoMes.informacionCuentas, // Etiquetas
          datasets: [
            {
              label: 'Monto',
              data: informacionGastoPresupuestoMes.informacionPresupuestoIngresados,
              backgroundColor: listadoColores,
              borderColor: '#FFFFFF', // Borde blanco para separación
              borderWidth: 2,
              hoverOffset: 10, // Efecto de separación al pasar el cursor
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom', // Mover la leyenda al costado derecho
              labels: {
                font: {
                  size: 10, // Tamaño de fuente
                },
              },
            },
            title: {
              display: true,
              text: 'Gráfico de Presupuestos',
              font: {
                size: 16,
                weight: 'bold',
              },
            },
          },
        },
      });

      this.chartGasto = new Chart(ctx2, {
        type: 'doughnut', // Tipo de gráfico Doughnut
        data: {
          labels: informacionGastoPresupuestoMes.informacionCuentas,
          datasets: [
            {
              label: 'Monto',
              data: informacionGastoPresupuestoMes.informacionGastosIngresados,
              backgroundColor: listadoColores,
              borderColor: '#FFFFFF', // Borde blanco para separación
              borderWidth: 2,
              hoverOffset: 10, // Efecto de separación al pasar el cursor
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom', // Mover la leyenda al costado derecho
              labels: {
                font: {
                  size: 10, // Tamaño de fuente
                },
              },
            },
            title: {
              display: true,
              text: 'Gráfico de Gastos',
              font: {
                size: 16,
                weight: 'bold',
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error Generación DashBoard', error.message);
      } else {
        this.toastr.error('Error Generación DashBoard', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  onFocusDB2(event: any) {
    this.listaFiltradaCuentasPlanDB2 = this.listaCuentasPlanDB2;
    this.visualizarSugerenciasDB2 = true;
  }

  onInputChangeDB2(event: any) {
    const value = event.target.value.toLowerCase();
    this.listaFiltradaCuentasPlanDB2 = this.listaCuentasPlanDB2.filter(suggestion =>
      suggestion.value.toLowerCase().includes(value.toLowerCase())
    );
  }

  onSuggestionClickDB2(suggestion: any) {
    this.idCuentaSeleccionadaDB2 = suggestion.key;
    this.nombreCuentaSeleccionadaDB2 = suggestion.value;
    this.visualizarSugerenciasDB2 = false;
    this.GenerarGraficasPastel();
  }

  onBlurDB2() {
    setTimeout(() => {
      this.visualizarSugerenciasDB2 = false;
    }, 200);
  }

  handleKeyDownDB2(event: KeyboardEvent) { }

  generateColors(count: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(this.getRandomColor());
    }
    return colors;
  }

  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

}

interface KeyValue {
  key: number;
  value: string;
}