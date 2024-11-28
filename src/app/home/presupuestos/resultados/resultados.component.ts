import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { AppComponent } from 'src/app/app.component';
import { IGastoPresupuesto, IPlanCuentas, IPlanCuentasPresupuesto } from 'src/app/models/plan-cuentas';
import { IGastoMensual, IGastosRespuesta } from 'src/app/models/presupuesto-gastos';
import { LoadingService } from 'src/app/services/loading.service';
import { PlanCuentasService } from 'src/app/services/plan-cuentas.service';
import { PresupuestoGastoService } from 'src/app/services/presupuesto-gasto.service';
import { ToastrService } from 'src/app/services/toastr.service';
import Swal from 'sweetalert2';
declare var $: any;
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.css']
})
export class ResultadosComponent {

  //Variables
  anioPresupuesto:any=2024;
  lstPlanCuentas:(IPlanCuentas & Record<string, any>)[] = [];
  lstMeses:any[]=[];
  lstMesesPendientes:any[]=[];
  lstPlanCuentasPresupuesto :IPlanCuentasPresupuesto[]=[];
  registroGastosForm!: FormGroup;
  filterText: string = '';
  file:any;
  cabeceraMeses:any[]=[];
  listaDatos:any[]=[];
  nameFile:any;
  arrayBuffer: any;
  registrosExcel:any;
  registrosExcelAuxiliar:any;
  mesDesde:any=0;
  mesHasta:any=0;
  valorOriginalEditar:number=0;
  lstAnios:any[]=[];

  constructor(private planCuentasService:PlanCuentasService,
    private fb: FormBuilder,
    private presupuestoGastoService:PresupuestoGastoService,
    private toastrService:ToastrService,
    private loadingService:LoadingService,
    private appComponent: AppComponent) { 
      this.lstMeses = [
        { id: 1, nombre: 'Enero' },{ id: 2, nombre: 'Febrero' },{ id: 3, nombre: 'Marzo' },{ id: 4, nombre: 'Abril' },
        { id: 5, nombre: 'Mayo' },{ id: 6, nombre: 'Junio' },{ id: 7, nombre: 'Julio' },{ id: 8, nombre: 'Agosto' },
        { id: 9, nombre: 'Septiembre' },{ id: 10, nombre: 'Octubre' },{ id: 11, nombre: 'Noviembre' },{ id: 12, nombre: 'Diciembre' },
      ];
      this.crearregistroGastosForm();
     }

  async ngOnInit(){
    this.lstAnios = await this.planCuentasService.obtenerAniosValidos();
    this.anioPresupuesto = new Date().getFullYear();
    this.onChangeAnio();
    this.crearregistroGastosForm();
  }

  crearregistroGastosForm() {
    this.registroGastosForm = this.fb.group({
      mesRegistro: [0, [Validators.required]],
      archivo: [null, [Validators.required]],
    });
  }

  async cargarPlanCuentas(){
    this.loadingService.showLoading();
    this.lstPlanCuentas = await this.planCuentasService.obtenerPlanCuentas();
    let registros:IGastosRespuesta = await this.presupuestoGastoService.obtenerGastosPresupuestoPlanCuenta(this.anioPresupuesto);
    this.cabeceraMeses = registros.listaMesesGastos;
    this.listaDatos = registros.informacionGastoPresupuesto;
    this.loadingService.hideLoading();
  }

  get filteredData() {
    if(this.listaDatos){
      return this.listaDatos.filter(plan => 
        plan.codigoPlan?.toLowerCase().includes(this.filterText.toLowerCase()) || 
        plan.nombrePlan.toLowerCase().includes(this.filterText.toLowerCase())
      );
    }else{
      return [];
    }

  }

  async abrirModal(){
    $('#planModal').modal('show');
    $('#planModal').on('shown.bs.modal', async () => {
      try {
        this.crearregistroGastosForm();
        this.lstMesesPendientes = await this.presupuestoGastoService.obtenerMesGastoPendientes(this.anioPresupuesto);
      } catch (error) {
        console.error('Error al obtener los meses pendientes', error);
      }
    });
  }

  async OnSubmit(){

    if (this.registroGastosForm.valid && this.registroGastosForm.value.mesRegistro!=0) {
    let listaGastos :IGastoMensual[]=[];
    this.registrosExcel.forEach((element:any) => {
      let item={
        AnioGastoPresupuesto:this.anioPresupuesto,
        MesGastoPresupuesto:this.registroGastosForm.value.mesRegistro,
        IdPlan:element.Id,
        ValorGastoMensual:element.Gasto
      }
      listaGastos.push(item);
    });
    const mensajeInsercion = await this.presupuestoGastoService.agregarGastoMensual(listaGastos);
    Swal.fire({
      text: mensajeInsercion,
      icon: 'success',
    }).then(() => {
      window.location.reload();
    });
    } else {
      this.appComponent.validateAllFormFields(this.registroGastosForm);
      this.toastrService.error('Error al guardar los registros', 'No se seleccionaron todos los campos necesarios.');
    }
  }
  validarExcel(){
    let headers: any[]= [];
    let arraylistAux = this.registrosExcelAuxiliar;
    headers = arraylistAux[0] as string[];
    let camposObligatorios =['Id', 'Codigo', 'Nombre', 'Gasto'];
    camposObligatorios.forEach(element => {
      let encontro = headers.find((item)=>item==element);
      if (!encontro) {
        this.toastrService.error('Columna Faltante','El formato debe contener la columna '+element);
        return;
      }
    });
    for (let index = 0; index < this.registrosExcel.length; index++) {
      if (isNaN(Number(this.registrosExcel[index].Gasto))||String(this.registrosExcel[index].Gasto).trim()=='') {
        this.toastrService.error('Valor Gasto Incorrecto','Revisar valor en: '+this.registrosExcel[index].Nombre);
        break;
      }   
    }
  }
  descargarFormato(){
    let listaPlanes:any[]=[];
    this.lstPlanCuentas.forEach(element => {
      let item ={
        Id:element.idPlan,
        Codigo:element.codigoPlan,
        Nombre:element.nombrePlan,
        Gasto:''
      }
      listaPlanes.push(item);
    });
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(listaPlanes); 
    const wb: XLSX.WorkBook = XLSX.utils.book_new();  
    XLSX.utils.book_append_sheet(wb, ws, 'formato');  
    XLSX.writeFile(wb, 'formatoGastos.xlsx'); 
  }

  async onChangeAnio(){
    this.loadingService.showLoading();
    this.lstPlanCuentas = await this.planCuentasService.obtenerPlanCuentas();
    this.cabeceraMeses=[];
    this.listaDatos=[];
    let registros:IGastosRespuesta = await this.presupuestoGastoService.obtenerGastosPresupuestoPlanCuenta(this.anioPresupuesto);
    this.cabeceraMeses = registros.listaMesesGastos;

    this.listaDatos = registros.informacionGastoPresupuesto;
    this.loadingService.hideLoading();
  }

  async onFileChange(event:any) {
    this.loadingService.showLoading();
    setTimeout(() => {
      let file = event.target.files[0];
        if(file){
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
            this.validarExcel();
          }
        }
        this.loadingService.hideLoading();

    }, 500);
  }

  async celdaEditada(plan: any,mes:any,valorNuevo:number) {
    if(this.valorOriginalEditar != valorNuevo){
      let item:IGastoPresupuesto={
        anioGastoPresupuesto:this.anioPresupuesto,
        mesGastoPresupuesto:mes.idMes,
        idPlan:plan.idPlan,
        valorGastoMensual:valorNuevo
      }

      let response = await this.presupuestoGastoService.actualizarValorGastoPresupuesto(item,0);
      this.onChangeAnio();
    }
  }

  celdaOriginal(valorOriginal:number){
    this.valorOriginalEditar = valorOriginal;

  }

  rangoMeses(event:any){

  }
}
