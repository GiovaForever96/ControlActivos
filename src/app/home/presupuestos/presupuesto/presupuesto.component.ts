import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { IGastoPresupuesto, IHistorialGastoPresupuesto, IPlanCuentas, IPlanCuentasPresupuesto } from 'src/app/models/plan-cuentas';
import { LoadingService } from 'src/app/services/loading.service';
import { PlanCuentasService } from 'src/app/services/plan-cuentas.service';
import { PresupuestoGastoService } from 'src/app/services/presupuesto-gasto.service';
import { ToastrService } from 'src/app/services/toastr.service';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import * as XLSX from 'xlsx';
declare var $: any;

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.component.html',
  styleUrls: ['./presupuesto.component.css']
})
export class PresupuestoComponent {

  @ViewChild('dataTableHistorial', { static: false }) tableHistorial!: ElementRef;

  constructor(private planCuentasService: PlanCuentasService,
    private el: ElementRef,
    private renderer: Renderer2,
    private appComponent: AppComponent,
    private presupuestoGastoService: PresupuestoGastoService,
    private loadingService: LoadingService,
    private toastr: ToastrService
  ) {
    this.lstMeses = appComponent.obtenerMesesAnio();
  }
  //Variables
  lstPlanCuentas: (IPlanCuentas & Record<string, any>)[] = [];
  lstPresupuestos: any[] = [];
  lstPlanCuentasPresupuesto: IPlanCuentasPresupuesto[] = [];
  lstMeses: any[] = [];
  anioPresupuesto: any;
  filterText: string = '';
  disableSubir: boolean = false;
  nameFile: any;
  arrayBuffer: any;
  registrosExcel: any[] = [];
  lstAnios: any[] = [];
  lstRoles: string[] = [];
  valorOriginalEditar: number = 0;
  verTablaPresupuesto: boolean = false;
  fileName: string = '';
  lstHistorial: IHistorialGastoPresupuesto[] = [];
  dtOptions: any;
  dataTable: any;

  async ngOnInit() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Presupuesto');
      this.lstAnios = await this.planCuentasService.obtenerAniosValidos();
      this.anioPresupuesto = new Date().getFullYear();
      const body = this.el.nativeElement.ownerDocument.body;
      this.renderer.setStyle(body, 'overflow', '');
      this.lstRoles = localStorage.getItem('roles')?.split(',') ?? [];
      this.cargarPlanCuentas();
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

  async cargarPlanCuentas() {
    this.lstPlanCuentas = await this.planCuentasService.obtenerPlanCuentas();
    this.lstPresupuestos = await this.presupuestoGastoService.obtenerPresupuestoCuentaPlanAnual(this.anioPresupuesto);
    this.lstPlanCuentas.forEach(cuenta => {
      let encontro = false;
      this.lstPresupuestos.forEach(element => {
        if (cuenta.idPlan == element.idPlan) {
          encontro = true;
          element['nombrePlan'] = cuenta?.nombrePlan;
          element['codigoPlan'] = cuenta?.codigoPlan;
          this.lstMeses.forEach(mes => {
            element[mes.nombre] = element.valorPresupuestoMensual[mes.id - 1];
          });
        }
      });
      if (!encontro) {
        let itemPresupuesto: any = {
          idPlan: cuenta.idPlan,
          anioPresupuesto: this.anioPresupuesto,
          valorPresupuestoMensual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          nombrePlan: cuenta?.nombrePlan,
          codigoPlan: cuenta?.codigoPlan
        }
        this.lstMeses.forEach(mes => {
          itemPresupuesto[mes.nombre] = 0;
        });
        this.lstPresupuestos.push(itemPresupuesto);
      }
    });
    this.ordenarLista();

  }

  ordenarLista() {
    this.lstPresupuestos.sort((a, b) => {
      if (a.codigoPlan < b.codigoPlan) {
        return -1;
      } else if (a.codigoPlan > b.codigoPlan) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  // Propiedad para almacenar los datos filtrados
  get filteredData() {
    return this.lstPresupuestos.filter(plan =>
      plan['codigoPlan']?.toLowerCase().includes(this.filterText?.toLowerCase()) ||
      plan['nombrePlan']?.toLowerCase().includes(this.filterText?.toLowerCase())
    );
  }

  async guardarPresupuesto() {
    this.lstPresupuestos.forEach(element => {
      let lstValores: number[] = [];
      this.lstMeses.forEach(mes => {
        lstValores.push(element[mes.nombre]);
      });
      let item: IPlanCuentasPresupuesto = {
        anioPresupuesto: this.anioPresupuesto,
        idPlan: element.idPlan,
        valorPresupuestoMensual: lstValores
      };
      this.lstPlanCuentasPresupuesto.push(item);
    });
    await this.presupuestoGastoService.agregarPresupuestoAnual(this.lstPlanCuentasPresupuesto);
    this.toastr.success("Guardado información", "Información presupuesto actualizado correctamente");
  }

  async onChangeAnio() {
    try {
      this.loadingService.showLoading();
      let response = await this.presupuestoGastoService.verificarExistePresupuestoCargado(this.anioPresupuesto);
      this.verTablaPresupuesto = response;
      this.disableSubir = response;

      if (!this.disableSubir) {
        if (this.anioPresupuesto < new Date().getFullYear()) {
          this.disableSubir = true;
        }
      }
      this.lstPlanCuentas = await this.planCuentasService.obtenerPlanCuentas();
      this.lstPresupuestos = await this.presupuestoGastoService.obtenerPresupuestoCuentaPlanAnual(this.anioPresupuesto);
      this.lstHistorial = await this.presupuestoGastoService.obtenerHistorialGastoPresupuesto(this.anioPresupuesto, 1);

      this.lstPlanCuentas.forEach(cuenta => {
        let encontro = false;
        this.lstPresupuestos.forEach(element => {
          if (cuenta.idPlan == element.idPlan) {
            encontro = true;
            element['nombrePlan'] = cuenta?.nombrePlan;
            element['codigoPlan'] = cuenta?.codigoPlan;
            element['tieneHijos'] = cuenta?.tieneHijos;
            this.lstMeses.forEach(mes => {
              element[mes.nombre] = element.valorPresupuestoMensual[mes.id - 1];
            });
          }
        });
        if (!encontro) {
          let itemPresupuesto: any = {
            idPlan: cuenta.idPlan,
            anioPresupuesto: this.anioPresupuesto,
            valorPresupuestoMensual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            nombrePlan: cuenta?.nombrePlan,
            codigoPlan: cuenta?.codigoPlan,
            tieneHijos: cuenta?.tieneHijos,
          }
          this.lstMeses.forEach(mes => {
            itemPresupuesto[mes.nombre] = 0;
          });
          this.lstPresupuestos.push(itemPresupuesto);
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al obtener el presupuesto', error.message);
      } else {
        this.toastr.error('Error al obtener el presupuesto', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 2500);
    }
  }

  descargarFormato() {
    let listaPlanes: any[] = [];
    this.lstPlanCuentas.forEach(element => {
      let item: any = {
        Id: element.idPlan,
        Codigo: element.codigoPlan,
        Nombre: element.nombrePlan,
      }
      this.lstMeses.forEach(mes => {
        item[mes.nombre] = '';
      });
      listaPlanes.push(item);
    });
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(listaPlanes);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'formato');
    XLSX.writeFile(wb, 'formatoPresupuesto.xlsx');
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
          this.registrosExcel = arraylist;
        }
      }
      //Agregamos el nombre del archivo
      const input = event.target as HTMLInputElement;
      if (input?.files?.length) {
        this.fileName = input.files[0].name;
      }
      this.loadingService.hideLoading();
    }, 500);
  }

  cargarInformacion() {
    try {
      this.loadingService.showLoading();
      if (this.registrosExcel.length != 0) {
        $('#planModal').modal('hide');
        this.lstMeses.forEach(mes => {
          this.lstPlanCuentas.forEach(element => {
            let planExcel = this.registrosExcel.find(reg => reg.Id == element.idPlan);
            element[mes.nombre] = planExcel[mes.nombre];
          });
        });
        this.lstPlanCuentas.forEach(element => {
          let lstValores: number[] = [];
          this.lstMeses.forEach(mes => {
            lstValores.push(element[mes.nombre]);
          });
          let item: IPlanCuentasPresupuesto = {
            anioPresupuesto: this.anioPresupuesto,
            idPlan: element.idPlan,
            valorPresupuestoMensual: lstValores
          };
          this.lstPlanCuentasPresupuesto.push(item);
        });
        if (this.lstPlanCuentasPresupuesto.length != 0) {
          this.guardarInformacion();
        }
      } else {
        this.toastr.error("Información Presupuesto", "No se ha cargado el archivo del presupuesto.");
      }
    } catch (error) {
      this.toastr.error("Error en la carga", "No se ha podido cargar la información del presupuesto");
    } finally {
    }
  }

  async guardarInformacion() {
    try {
      this.loadingService.showLoading();
      await this.presupuestoGastoService.agregarPresupuestoAnual(this.lstPlanCuentasPresupuesto);
      this.toastr.success("Guardado información", "Información almacenada correctamente");
      this.loadingService.hideLoading();
    } catch (error) {
      this.toastr.error("Error en la carga", "No se ha podido cargar la información del presupuesto");
      this.loadingService.hideLoading();
    } finally {
      this.onChangeAnio();
    }
  }

  async abrirModal() {
    $('#planModal').modal('show');
    $('#planModal').on('shown.bs.modal', async () => {
    });
  }

  async celdaEditada(plan: any, mes: any, valorNuevo: number) {

    try {

      this.loadingService.showLoading();
      if (valorNuevo < 0) {
        this.toastr.warning("Valor incorrecto", "El valor ingresado no puede ser menor a 0");
        valorNuevo = this.valorOriginalEditar;
        return;
      }
      if (this.valorOriginalEditar === valorNuevo)
        return;

      const item: IGastoPresupuesto = {
        anioGastoPresupuesto: plan.anioPresupuesto,
        mesGastoPresupuesto: mes.id,
        idPlan: plan.idPlan,
        valorGastoMensual: valorNuevo,
        usuarioModificacion: localStorage.getItem('userName') ?? ''
      };

      await this.presupuestoGastoService.actualizarValorGastoPresupuesto(item, 1);
      this.onChangeAnio();
    } catch (error) {
      this.toastr.error("Error en la actualización", "No se ha podido actualizar el valor del presupuesto.");
    } finally {
    }

  }

  celdaOriginal(valorOriginal: number, plan: any) {
    this.valorOriginalEditar = valorOriginal;
  }

  permiteModificarRol(lstRolesPermitidos: string[]): boolean {
    return this.lstRoles.some(role => lstRolesPermitidos.includes(role));
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

}
