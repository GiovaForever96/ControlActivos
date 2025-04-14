import { ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { AppComponent } from 'src/app/app.component';
import { IDetallePlanCuenta, IGastoPresupuesto, IHistorialGastoPresupuesto, IPlanCuentas, IPlanCuentasPresupuesto } from 'src/app/models/plan-cuentas';
import { LoadingService } from 'src/app/services/loading.service';
import { PlanCuentasService } from 'src/app/services/plan-cuentas.service';
import { PresupuestoGastoService } from 'src/app/services/presupuesto-gasto.service';
import { ToastrService } from 'src/app/services/toastr.service';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
declare var $: any;

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.component.html',
  styleUrls: ['./presupuesto.component.css']
})
export class PresupuestoComponent {

  @ViewChild('dataTableHistorial', { static: false }) tableHistorial!: ElementRef;

  //#region Menu Contextual
  menuItems: MenuItem[] = [];
  selectedRow: any;
  //#endregion

  constructor(private planCuentasService: PlanCuentasService,
    private el: ElementRef,
    private renderer: Renderer2,
    private appComponent: AppComponent,
    private presupuestoGastoService: PresupuestoGastoService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
    private planCuentaService: PlanCuentasService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.lstMeses = appComponent.obtenerMesesAnio();
    if (this.lstMeses.length > 0) {
      this.lstMeses.push({ id: 13, nombre: 'Σ Meses', seleccionado: false })
    }
    this.detalleForm = this.fb.group({
      descripcion: ['', [Validators.required]],
      monto: [null, [Validators.required, Validators.min(0)]]
    });
    this.copiarValorForm = this.fb.group({
      descripcion: ['', [Validators.required]],
      montoOriginal: [0, [Validators.required, Validators.min(0)]],
      tipoOperacion: ['', Validators.required],
      tipoCalculo: [''],
      valorPorcentaje: [0],
      montoModificado: [0, Validators.required],
      cantidadMeses: [0, Validators.required],
    });
    this.calcularMontoModificado();
  }
  //Variables
  lstPlanCuentas: (IPlanCuentas & Record<string, any>)[] = [];
  lstPresupuestos: any[] = [];
  lstPlanCuentasPresupuesto: IPlanCuentasPresupuesto[] = [];
  lstMeses: any[] = [];
  lstMesesModal: any[] = [];
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
  informacionFilaDetalle: any;
  nombreMesDetalle: string = '';
  detalleForm: FormGroup = null!;
  copiarValorForm: FormGroup = null!;
  lstDetallesPlanCuenta: IDetallePlanCuenta[] = [];
  lstDetallesPlanCuentaCopia: IDetallePlanCuenta[] = [];
  existeCambios: boolean = false;
  mostrarCalculo: boolean = true;
  lstDetallePlan: IDetallePlanCuenta[] = [];
  esEdicion: boolean = false;
  indiceEdicion: number = 0;
  idDetallePlan: number = 0;
  lstDetallePlanCuenta: IDetallePlanCuenta[] = [];

  async ngOnInit() {
    try {
      this.loadingService.showLoading();
      this.appComponent.setTitle('Presupuesto');
      this.lstAnios = await this.planCuentasService.obtenerAniosValidos();
      this.anioPresupuesto = new Date().getFullYear();
      const body = this.el.nativeElement.ownerDocument.body;
      this.renderer.setStyle(body, 'overflow', 'hidden');
      this.lstRoles = localStorage.getItem('roles')?.split(',') ?? [];
      this.existeCambios = false;
      this.lstDetallePlan = await this.planCuentaService.obtenerDetallePlanCuenta();
      this.lstDetallePlanCuenta = await this.planCuentaService.obtenerDetallePlanCuenta();
      // Define los elementos del menú contextual
      this.menuItems = [
        {
          label: 'Agregar Detalle',
          icon: 'pi pi-plus-circle',
          disabled: !this.permiteModificarRol(['FIN']),
          command: () => this.agregarDetalle(this.selectedRow)
        },
        {
          label: 'Copiar Valor',
          icon: 'pi pi-copy',
          disabled: !this.permiteModificarRol(['FIN']),
          command: () => this.copiarValorPresupuesto(this.selectedRow)
        }, {
          label: 'Eliminar Detalle',
          icon: 'pi pi-times',
          disabled: !this.permiteModificarRol(['FIN']),
          command: () => this.eliminarDetalleCuenta(this.selectedRow)
        }
      ];
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

  get filteredData() {
    return this.lstPresupuestos.filter(plan =>
      plan['codigoPlan']?.toLowerCase().includes(this.filterText?.toLowerCase()) ||
      plan['nombrePlan']?.toLowerCase().includes(this.filterText?.toLowerCase())
    );
  }

  async guardarPresupuesto() {
    this.lstPresupuestos.forEach(element => {
      var esUltimoNivel = this.lstPlanCuentas.filter(x => x.idPadre == element.idPlan);
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
    var nombreUsuario = localStorage.getItem('userName') ?? '';
    await this.presupuestoGastoService.agregarPresupuestoAnual(this.lstPlanCuentasPresupuesto, nombreUsuario);
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
            if (element[mes.nombre] == '' || element[mes.nombre] == undefined) {
              lstValores.push(0);
            } else {
              lstValores.push(element[mes.nombre] ?? 0);
            }
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
      var nombreUsuario = localStorage.getItem('userName') ?? ''
      await this.presupuestoGastoService.agregarPresupuestoAnual(this.lstPlanCuentasPresupuesto, nombreUsuario);
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
      if (this.valorOriginalEditar === valorNuevo) {
        this.loadingService.hideLoading();
        return;
      }

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
            {
              title: 'Fecha Modificación',
              data: 'fechaModificacion',
              render: function (data: any, type: any, row: any) {
                if (data) {
                  const date = new Date(data);
                  return date.toLocaleString();
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

  onRightClick(event: MouseEvent, rowData: any, cm: any) {

    event.preventDefault();

    if (!this.consultaEsPenultimoNivel(rowData.idPlan)) return;

    const target = event.target as HTMLElement;
    const columnElement = target.closest('td[data-column-name], th[data-column-name]');
    this.nombreMesDetalle = columnElement?.getAttribute('data-column-name') ?? '';

    if (this.lstMeses.find(x => x.nombre == this.nombreMesDetalle)) {
      this.selectedRow = rowData;
      // Coordenadas iniciales del clic
      let clickX = event.clientX - 250;
      let clickY = event.clientY - 100;
      // Mostrar el menú contextual
      cm.show(event);
      // Agregar un detector de clic global para cerrar el menú
      const closeMenu = (e: MouseEvent) => {
        const menuElement = document.querySelector('.p-contextmenu') as HTMLElement;
        if (menuElement && !menuElement.contains(e.target as Node)) {
          cm.hide();
          document.removeEventListener('click', closeMenu);
        }
      };
      document.addEventListener('click', closeMenu);
      setTimeout(() => {
        const menuElement = document.querySelector('.p-contextmenu') as HTMLElement;
        if (menuElement) {
          // Obtener dimensiones del menú
          const menuWidth = menuElement.offsetWidth;
          const menuHeight = menuElement.offsetHeight;
          // Obtener dimensiones de la ventana
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          // Verificar si el menú se desborda horizontalmente
          if (clickX + menuWidth + 300 > windowWidth) {
            clickX = windowWidth - menuWidth - 400;
          }
          // Verificar si el menú se desborda verticalmente
          if (clickY + menuHeight + 200 > windowHeight) {
            clickY = windowHeight - menuHeight - 100;
          }
          // Aplicar las coordenadas ajustadas
          menuElement.style.left = `${clickX}px`;
          menuElement.style.top = `${clickY}px`;
          menuElement.style.position = 'absolute';
          menuElement.style.zIndex = '1002';
          menuElement.style.visibility = 'visible';
          menuElement.style.transition = 'none';
          // Forzar la detección de cambios
          this.cdr.detectChanges();
        }
      }, 0);
    }
  }

  agregarDetalle(row: any) {
    try {

      this.loadingService.showLoading();
      this.lstDetallesPlanCuenta = [];
      this.informacionFilaDetalle = row;
      let idMes = this.lstMeses.find(x => x.nombre == this.nombreMesDetalle)?.id;
      this.lstMesesModal = this.lstMeses.filter(x => x.id > idMes && x.id != 13);
      this.lstMesesModal.unshift({ id: 0, nombre: "Todos", seleccionado: false });
      $('#detalleCuentaModal').modal('show');
      $('#detalleCuentaModal').off('shown.bs.modal');
      $('#detalleCuentaModal').on('shown.bs.modal', async () => {
        try {
          this.esEdicion = false;
          let idPlan = this.informacionFilaDetalle.idPlan;
          this.lstDetallesPlanCuenta = await this.planCuentasService.obtenerDetallePlanCuentaPorId(idPlan, idMes);
          this.detalleForm.reset();
        } catch (error: any) {
          this.toastr.error('Error al cargar los detalles del plan', error.message);
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al abrir el modal de detalles', error.message);
      } else {
        this.toastr.error('Error al abrir el modal de detalles', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 3000);
    }
  }

  async cerrarModalDetalle() {
    this.loadingService.showLoading();
    $('#detalleCuentaModal').modal('hide');
    let mesesCopiarDetalle = this.lstMesesModal.filter(x => x.seleccionado && x.id != 0);
    if (mesesCopiarDetalle.length > 0) {
      try {
        let idPlan = this.informacionFilaDetalle.idPlan;
        let promesas: Promise<any>[] = [];
        for (const mes of mesesCopiarDetalle) {
          try {
            // Obtener detalle del plan de cuentas
            this.lstDetallesPlanCuenta = await this.planCuentasService.obtenerDetallePlanCuentaPorId(idPlan, mes.id);
            // Copiar detalles a los meses seleccionados
            for (const informacion of this.lstDetallesPlanCuentaCopia) {
              informacion.mes = mes.id;
              promesas.push(this.planCuentasService.insertarDetallePlanCuenta(informacion));
            }
            // Calcular totales
            let totalCuentaMes = this.calcularTotal();
            let totalDetalle = this.lstDetallesPlanCuentaCopia.reduce((total, registro) => total + registro.montoDetalle, 0);
            // Actualizar presupuesto
            const item: IGastoPresupuesto = {
              anioGastoPresupuesto: this.anioPresupuesto,
              mesGastoPresupuesto: mes.id,
              idPlan: idPlan,
              valorGastoMensual: Number(totalCuentaMes) + Number(totalDetalle),
              usuarioModificacion: localStorage.getItem('userName') ?? ''
            };
            promesas.push(this.presupuestoGastoService.actualizarValorGastoPresupuesto(item, 1));
          } catch (error: any) {
            this.toastr.error('Copiar Detalle', error.message);
          }
        }
        // Esperar a que todas las promesas se resuelvan antes de continuar
        await Promise.all(promesas);
      } catch (error: any) {
        this.toastr.error('Error al procesar los datos', error.message);
      } finally {
        // Limpiar datos y recargar después de completar todos los procesos
        this.lstDetallesPlanCuentaCopia = [];
        this.lstMesesModal.forEach(item => item.seleccionado = false);
        if (this.existeCambios) {
          setTimeout(() => {
            this.loadingService.hideLoading();
            window.location.reload();
          }, 3000);
        }
      }
    } else {
      if (this.existeCambios) {
        window.location.reload();
      }
      this.loadingService.hideLoading();
    }
  }

  consultaEsPenultimoNivel(idPlan: number): boolean {
    let idHijos = this.lstPlanCuentas
      .filter(x => x.idPadre === idPlan)
      .map(x => x.idPlan);

    let sonPadres = idHijos.some(hijoId =>
      this.lstPlanCuentas.some(x => x.idPadre === hijoId)
    );
    return !sonPadres;
  }

  async onSubmitDetalle() {
    try {
      this.loadingService.showLoading(); // Mostrar carga

      if (!this.detalleForm.valid) {
        this.toastr.error('Error en el formulario', 'Por favor, complete los campos requeridos.');
        return;  // Terminar si el formulario no es válido
      }

      let informacion = this.detalleForm.value;

      if (this.esEdicion) {
        // Si es una edición, terminarla correctamente
        this.esEdicion = false;
        await this.eliminarRegistro(this.indiceEdicion);
        this.indiceEdicion = 0;
      }

      // Crear objeto del detalle del plan de cuenta
      let detallePlanCuenta: IDetallePlanCuenta = {
        descripcionDetalle: informacion.descripcion,
        montoDetalle: informacion.monto,
        estaActivo: true,
        fechaHoraDetalle: new Date(),
        usuarioDetalle: localStorage.getItem('userName') ?? '',
        idPlanDetalle: this.informacionFilaDetalle.idPlan,
        planCuenta: null!,
        idDetallePlan: 0,
        mes: this.lstMeses.find(x => x.nombre === this.nombreMesDetalle)?.id ?? 0,
        anio: this.anioPresupuesto
      };

      // Agregar el nuevo detalle a las listas locales
      this.lstDetallesPlanCuenta.push(detallePlanCuenta);
      this.lstDetallesPlanCuentaCopia.push(detallePlanCuenta);

      // Resetear el formulario
      this.detalleForm.reset();

      // Intentar la inserción en la base de datos
      const mensajeInsercion = await this.planCuentasService.insertarDetallePlanCuenta(detallePlanCuenta);
      this.toastr.success('Detalle de plan de cuenta', mensajeInsercion);

      // Actualizar el presupuesto correspondiente
      this.actualizarValorGastoPresupuesto(this.informacionFilaDetalle.idPlan);

    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al agregar el detalle', error.message);
      } else {
        this.toastr.error('Error al agregar el detalle', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading(); // Ocultar carga sin retrasos
    }
  }

  async eliminarRegistro(index: number) {
    try {
      this.loadingService.showLoading();
      let informacionDetalle = this.lstDetallesPlanCuenta[index];
      this.lstDetallesPlanCuenta.splice(index, 1);
      const mensajeEliminacion = await this.planCuentasService.eliminarDetallePlanCuenta(informacionDetalle.idDetallePlan);
      this.toastr.success('Detalle de plan de cuenta', mensajeEliminacion);
      //Actualizar el valor total de la cuenta por mes
      this.actualizarValorGastoPresupuesto(this.informacionFilaDetalle.idPlan);
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al eliminar el detalle', error.message);
      } else {
        this.toastr.error('Error al eliminar el detalle', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 3000);
    }
  }

  async eliminarDetalleRegistros(index: number) {
    try {
      // //Eliminación del registro actual
      this.loadingService.showLoading();
      let promesas: Promise<any>[] = [];
      let informacionDetalle = this.lstDetallesPlanCuenta[index];
      let lstMesesSeleccionados = this.lstMesesModal.filter(x => x.seleccionado && x.id != 0);
      let detallePlanIdDescripcion = await this.planCuentaService.obtenerDetallePlanCuentaPorIdDescripcion(informacionDetalle.idPlanDetalle,
        informacionDetalle.descripcionDetalle);
      //Agregamos la eliminación del mes seleccionado
      this.lstDetallesPlanCuenta.splice(index, 1);
      promesas.push(this.planCuentasService.eliminarDetallePlanCuenta(informacionDetalle.idDetallePlan));
      //Actualizar el valor total de la cuenta por mes
      promesas.push(this.actualizarValorGastoPresupuesto(this.informacionFilaDetalle.idPlan));
      //Consulta de identificador detalle plan
      if (lstMesesSeleccionados.length > 0) {
        lstMesesSeleccionados.forEach(mesSeleccionado => {
          let informacionDetalleMes = detallePlanIdDescripcion.find(x => x.mes == mesSeleccionado.id);
          if (informacionDetalleMes != undefined) {
            let detalleCuentaMes = this.lstDetallePlan.filter(x => x.idPlanDetalle == informacionDetalle.idPlanDetalle && x.mes == mesSeleccionado.id);
            let montoCuentaMes = detalleCuentaMes.reduce((total, registro) => total + registro.montoDetalle, 0);
            let nuevoMonto = Number(montoCuentaMes ?? 0) - Number(informacionDetalle.montoDetalle);
            promesas.push(this.planCuentasService.eliminarDetallePlanCuenta(informacionDetalleMes.idDetallePlan));
            promesas.push(this.actualizarValorGastoPresupuestoMasivo(informacionDetalle.idPlanDetalle, mesSeleccionado.id, nuevoMonto));
          }
        });
      }
      // Ejecutamos las promesas generadas
      await Promise.all(promesas);
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al eliminar el detalle', error.message);
      } else {
        this.toastr.error('Error al eliminar el detalle', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
        window.location.reload();
      }, 3000);
    }
  }

  calcularTotal(): number {
    return this.lstDetallesPlanCuenta.reduce((total, registro) => total + registro.montoDetalle, 0);
  }

  async actualizarValorGastoPresupuesto(idPlan: number) {
    try {
      this.loadingService.showLoading();
      //Actualizar el valor total de la cuenta por mes
      const item: IGastoPresupuesto = {
        anioGastoPresupuesto: this.anioPresupuesto,
        mesGastoPresupuesto: this.lstMeses.find(x => x.nombre == this.nombreMesDetalle)?.id ?? 0,
        idPlan: idPlan,
        valorGastoMensual: this.calcularTotal(),
        usuarioModificacion: localStorage.getItem('userName') ?? ''
      };
      const mensajeActualizacion = await this.presupuestoGastoService.actualizarValorGastoPresupuesto(item, 1);
      this.toastr.success('Detalle de plan de cuenta', mensajeActualizacion);
      this.existeCambios = true;
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al agregar el detalle', error.message);
      } else {
        this.toastr.error('Error al agregar el detalle', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 3000);
    }
  }

  async actualizarValorGastoPresupuestoMasivo(idPlan: number, mes: number, monto: number) {
    try {
      this.loadingService.showLoading();
      //Actualizar el valor total de la cuenta por mes
      const item: IGastoPresupuesto = {
        anioGastoPresupuesto: this.anioPresupuesto,
        mesGastoPresupuesto: mes,
        idPlan: idPlan,
        valorGastoMensual: monto,
        usuarioModificacion: localStorage.getItem('userName') ?? ''
      };
      const mensajeActualizacion = await this.presupuestoGastoService.actualizarValorGastoPresupuesto(item, 1);
      this.toastr.success('Detalle de plan de cuenta', mensajeActualizacion);
      this.existeCambios = true;
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al agregar el detalle', error.message);
      } else {
        this.toastr.error('Error al agregar el detalle', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 3000);
    }
  }

  GetSpanishLanguage() {
    return SpanishLanguage;
  }

  copiarValorPresupuesto(row: any) {
    try {
      this.loadingService.showLoading();
      let idMes = this.lstMeses.find(x => x.nombre == this.nombreMesDetalle)?.id;
      let valorPresupuesto = row.valorPresupuestoMensual[idMes - 1];
      if (valorPresupuesto <= 0) {
        this.toastr.warning("Valor incorrecto", "El valor ingresado no puede ser menor o igual a 0");
        return;
      }
      if (idMes == 12) {
        this.toastr.warning("Copiar Valores", "No se puede copiar el valor de Diciembre");
        return;
      }
      this.informacionFilaDetalle = row;
      $('#copiarValorModal').modal('show');
      $('#copiarValorModal').off('shown.bs.modal');
      $('#copiarValorModal').on('shown.bs.modal', async () => {
        try {
          this.copiarValorForm.reset();
          this.copiarValorForm.patchValue({
            descripcion: `${row.codigoPlan}-${row.nombrePlan}`,
            montoOriginal: valorPresupuesto,
            tipoOperacion: '',
            tipoCalculo: '',
            valorPorcentaje: 0,
            montoModificado: 0,
            cantidadMeses: idMes + 1
          });
          this.lstMesesModal = this.lstMeses.filter(x => x.id > idMes);
        } catch (error: any) {
          this.toastr.error('Error al cargar los detalles del plan', error.message);
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al abrir el modal de detalles', error.message);
      } else {
        this.toastr.error('Error al abrir el modal de detalles', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 3000);
    }
  }

  cerrarModalCopiarValor() {
    $('#copiarValorModal').modal('hide');
  }

  calcularMontoModificado(): void {
    this.copiarValorForm.valueChanges.subscribe((formValues) => {
      const { montoOriginal, tipoOperacion, tipoCalculo, valorPorcentaje } = formValues;
      // Verificamos si hay un monto original y tipo de operación
      if (montoOriginal != null && tipoOperacion) {
        let montoModificado = montoOriginal;
        if (tipoOperacion === 'igual') {
          montoModificado = montoOriginal;
        } else {
          // Validamos que tipoCalculo y valorPorcentaje sean válidos para las demás operaciones
          if (tipoCalculo && valorPorcentaje != null) {
            const valor =
              tipoCalculo === 'porcentaje' ? (montoOriginal * valorPorcentaje) / 100 : valorPorcentaje;
            if (tipoOperacion === 'aumentar') {
              montoModificado = montoOriginal + valor;
            } else if (tipoOperacion === 'disminuir') {
              montoModificado = montoOriginal - valor;
            }
          }
        }
        montoModificado = parseFloat(montoModificado.toFixed(2));
        this.copiarValorForm.get('montoModificado')?.setValue(montoModificado, { emitEvent: false });
      }
    });
  }

  onTipoOperacionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.mostrarCalculo = value !== 'igual';
    if (value === 'igual') {
      this.copiarValorForm.patchValue({ tipoCalculo: '', valorPorcentaje: null });
    }
  }

  async onSubmitCopiarValores() {
    try {
      this.loadingService.showLoading();
      if (this.copiarValorForm.valid) {
        let idMes = this.lstMeses.find(x => x.nombre == this.nombreMesDetalle)?.id;
        let informacion = this.copiarValorForm.value;
        for (let index = idMes + 1; index <= informacion.cantidadMeses; index++) {
          this.loadingService.showLoading();
          //Actualizar el valor total de la cuenta por mes
          const item: IGastoPresupuesto = {
            anioGastoPresupuesto: this.anioPresupuesto,
            mesGastoPresupuesto: index,
            idPlan: this.informacionFilaDetalle.idPlan,
            valorGastoMensual: informacion.montoModificado,
            usuarioModificacion: localStorage.getItem('userName') ?? ''
          };
          try {
            let nombreMes = this.lstMeses[index - 1].nombre;
            //Creación de objeto
            let detallePlanCuenta: IDetallePlanCuenta = {
              descripcionDetalle: `${informacion.descripcion}-${nombreMes}`,
              montoDetalle: informacion.montoModificado,
              estaActivo: true,
              fechaHoraDetalle: new Date(),
              usuarioDetalle: localStorage.getItem('userName') ?? '',
              idPlanDetalle: this.informacionFilaDetalle.idPlan,
              planCuenta: null!,
              idDetallePlan: 0,
              mes: index,
              anio: this.anioPresupuesto
            };
            //Agregar a la lista en la base de datos
            await this.planCuentasService.insertarDetallePlanCuenta(detallePlanCuenta);
            // Esperar la finalización de la operación asíncrona
            const mensajeActualizacion = await this.presupuestoGastoService.actualizarValorGastoPresupuesto(item, 1);
            this.toastr.success('Detalle de plan de cuenta', mensajeActualizacion);
          } catch (error: any) {
            // Manejar errores de la operación
            this.toastr.error('Error actualizando el gasto', error.message || 'Error desconocido');
          } finally { }
        }
      } else {
        this.toastr.error('Error en el formulario', 'Por favor, complete los campos requeridos.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al agregar el detalle', error.message);
      } else {
        this.toastr.error('Error al agregar el detalle', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      let timeOut = this.lstMesesModal.filter(x => x.seleccionado).length;
      setTimeout(() => {
        this.loadingService.hideLoading();
        window.location.reload();
      }, timeOut * 1000);
    }
  }

  eliminarDetalleCuenta(row: any) {
    try {

      this.loadingService.showLoading();
      this.lstDetallesPlanCuenta = [];
      this.informacionFilaDetalle = row;
      let idMes = this.lstMeses.find(x => x.nombre == this.nombreMesDetalle)?.id;
      this.lstMesesModal = this.lstMeses.filter(x => x.id > idMes && x.id != 13);
      this.lstMesesModal.unshift({ id: 0, nombre: "Todos", seleccionado: false });
      $('#eliminarDetalleCuentaModal').modal('show');
      $('#eliminarDetalleCuentaModal').off('shown.bs.modal');
      $('#eliminarDetalleCuentaModal').on('shown.bs.modal', async () => {
        try {
          this.esEdicion = false;
          let idPlan = this.informacionFilaDetalle.idPlan;
          this.lstDetallesPlanCuenta = await this.planCuentasService.obtenerDetallePlanCuentaPorId(idPlan, idMes);
        } catch (error: any) {
          this.toastr.error('Error al cargar los detalles del plan', error.message);
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al abrir el modal de detalles', error.message);
      } else {
        this.toastr.error('Error al abrir el modal de detalles', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 3000);
    }
  }

  async cerrarModalEliminarDetalle() {
    $('#eliminarDetalleCuentaModal').modal('hide');
  }

  toggleSelectAll() {
    const todos = this.lstMesesModal.find(item => item.id === 0);
    if (todos)
      this.lstMesesModal.forEach(item => item.seleccionado = todos.seleccionado);
  }

  updateSelectAll() {
    const todos = this.lstMesesModal.find(item => item.id === 0);
    if (todos)
      todos.seleccionado = this.lstMesesModal.slice(1).every(item => item.seleccionado);
  }

  obtenerInformacion(idPlan: any, mes: any): string | undefined {
    let mensajeTooltip: string = "Información:\n";
    let detalleCuenta = this.lstDetallePlanCuenta.filter(x => x.planCuenta!.idPlan == idPlan &&
      x.mes == mes &&
      x.anio == this.anioPresupuesto);
    if (detalleCuenta.length > 0) {
      detalleCuenta.forEach(x => {
        mensajeTooltip += `${x.descripcionDetalle}: ${this.appComponent.formatoDinero(x.montoDetalle, true)}\n`;
      });
      return mensajeTooltip;
    }
    return undefined;
  }

  exportarExcel() {
    const datos = this.filteredData.map(plan => {
      let row: Record<string, any> = {
        "Código": plan.codigoPlan,
        "Plan": plan.nombrePlan
      };

      // Agregar dinámicamente los valores de los meses
      this.lstMeses.forEach(mes => {
        row[mes.nombre] = plan[mes.nombre] || 0; // Evitar valores undefined
      });

      return row;
    });

    // Crear una hoja de Excel
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Presupuesto");

    // Guardar el archivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'Presupuesto.xlsx');
  }

  tieneDetallePlan(idPlan: number, idMes: number) {
    let detallePlanCuenta = this.lstDetallePlan.filter(x => x.planCuenta.idPlan == idPlan && x.mes == idMes && x.anio == this.anioPresupuesto);
    return detallePlanCuenta.length <= 1;
  }

  async editarRegistro(index: number) {
    try {
      this.esEdicion = true;
      let detallePlan = this.lstDetallesPlanCuenta[index];
      this.idDetallePlan = detallePlan.idDetallePlan;
      this.indiceEdicion = index;
      this.detalleForm.patchValue({ 'descripcion': detallePlan.descripcionDetalle, 'monto': detallePlan.montoDetalle });
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error('Error al eliminar el detalle', error.message);
      } else {
        this.toastr.error('Error al eliminar el detalle', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 3000);
    }
  }

  cancelarEdicion() {
    this.detalleForm.reset();
    this.esEdicion = false;
  }

  getTotal(month: string): number {
    return this.filteredData.reduce((acc, plan) => {
      const valor = Number(plan[month]) || 0;

      if (plan.codigoPlan === '4.') {
        return acc + valor; // Suma los valores del plan 4.
      } else if (plan.codigoPlan === '5.') {
        return acc - valor; // Resta los valores del plan 5.
      }

      return acc; // Si no es ni 4. ni 5., no hace nada.
    }, 0);
  }

}
