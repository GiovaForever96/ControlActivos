import { Component } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { AppComponent } from 'src/app/app.component';
import { IGastoPresupuesto, IPlanCuentas,IPlanCuentasPresupuesto } from 'src/app/models/plan-cuentas';
import { LoadingService } from 'src/app/services/loading.service';
import { PlanCuentasService } from 'src/app/services/plan-cuentas.service';
import { PresupuestoGastoService } from 'src/app/services/presupuesto-gasto.service';
import * as XLSX from 'xlsx';
declare var $: any;

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.component.html',
  styleUrls: ['./presupuesto.component.css']
})
export class PresupuestoComponent {
  constructor(private planCuentasService:PlanCuentasService,
    private presupuestoGastoService:PresupuestoGastoService,
    private loadingService:LoadingService
  ) {
    this.lstMeses = [
      { id: 1, nombre: 'Enero' },{ id: 2, nombre: 'Febrero' },{ id: 3, nombre: 'Marzo' },{ id: 4, nombre: 'Abril' },
      { id: 5, nombre: 'Mayo' },{ id: 6, nombre: 'Junio' },{ id: 7, nombre: 'Julio' },{ id: 8, nombre: 'Agosto' },
      { id: 9, nombre: 'Septiembre' },{ id: 10, nombre: 'Octubre' },{ id: 11, nombre: 'Noviembre' },{ id: 12, nombre: 'Diciembre' },
    ];
  }
  //Variables
  lstPlanCuentas:(IPlanCuentas & Record<string, any>)[] = [];
  //lstPresupuestos:(IPlanCuentasPresupuesto & Record<string, any>)[] = [];
  lstPresupuestos:any[] = [];
  lstPlanCuentasPresupuesto :IPlanCuentasPresupuesto[]=[];
  lstMeses:any[]=[];
  anioPresupuesto:any;
  filterText: string = '';
  disableSubir:boolean=false;
  disableGuardar:boolean=true;
  nameFile:any;
  arrayBuffer: any;
  registrosExcel:any[]=[];
  lstAnios:any[]=[];

  async ngOnInit(){
    this.lstAnios = await this.planCuentasService.obtenerAniosValidos();
    this.anioPresupuesto = new Date().getFullYear();
    //this.cargarPlanCuentas();
    this.onChangeAnio();
  }

  async cargarPlanCuentas(){
    this.lstPlanCuentas = await this.planCuentasService.obtenerPlanCuentas();
    this.lstPresupuestos = await this.presupuestoGastoService.obtenerPresupuestoCuentaPlanAnual(this.anioPresupuesto);
    this.lstPlanCuentas.forEach(cuenta => {
      let encontro=false;
      this.lstPresupuestos.forEach(element => {
        if(cuenta.idPlan==element.idPlan){
          encontro=true;
          element['nombrePlan']=cuenta?.nombrePlan;
          element['codigoPlan']=cuenta?.codigoPlan;
          this.lstMeses.forEach(mes => {
            element[mes.nombre]=element.valorPresupuestoMensual[mes.id-1];
          });
        }
      });
      if(!encontro){
        let itemPresupuesto:any = {
          idPlan:cuenta.idPlan,
          anioPresupuesto:this.anioPresupuesto,
          valorPresupuestoMensual:[0,0,0,0,0,0,0,0,0,0,0,0],
          nombrePlan:cuenta?.nombrePlan,
          codigoPlan:cuenta?.codigoPlan
        }
        this.lstMeses.forEach(mes => {
          itemPresupuesto[mes.nombre]=0;
        });
        this.lstPresupuestos.push(itemPresupuesto);
      }
    });
    this.ordenarLista();

  }

  ordenarLista(){
    this.lstPresupuestos.sort((a, b) => {
      if (a.codigoPlan < b.codigoPlan) {
        return -1; // a va antes que b
      } else if (a.codigoPlan > b.codigoPlan) {
        return 1; // b va antes que a
      } else {
        return 0; // a y b son iguales
      }
    });
  }


  // Propiedad para almacenar los datos filtrados
  get filteredData() {
    return this.lstPresupuestos.filter(plan => 
      plan['codigoPlan'].toLowerCase().includes(this.filterText.toLowerCase()) || 
      plan['nombrePlan'].toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  guardarPresupuesto(){
    
    this.lstPresupuestos.forEach(element => {
      let lstValores:number[]=[];
      this.lstMeses.forEach(mes => {
        lstValores.push(element[mes.nombre]);
      });
      let item :IPlanCuentasPresupuesto = {
        anioPresupuesto:this.anioPresupuesto,
        idPlan:element.idPlan,
        valorPresupuestoMensual:lstValores
      };
      this.lstPlanCuentasPresupuesto.push(item);
    });
    let response = this.presupuestoGastoService.agregarPresupuestoAnual(this.lstPlanCuentasPresupuesto);
  }

  async onChangeAnio(){
    let response = await this.presupuestoGastoService.verificarExistePresupuestoCargado(this.anioPresupuesto);
    this.disableSubir = response;

    if(!this.disableSubir){
      if(this.anioPresupuesto<new Date().getFullYear()){
        this.disableSubir = true;
      }
    }
    this.loadingService.showLoading();
    this.lstPlanCuentas = await this.planCuentasService.obtenerPlanCuentas();
    this.lstPresupuestos = await this.presupuestoGastoService.obtenerPresupuestoCuentaPlanAnual(this.anioPresupuesto);

    this.lstPlanCuentas.forEach(cuenta => {
      let encontro=false;
      this.lstPresupuestos.forEach(element => {
        if(cuenta.idPlan==element.idPlan){
          encontro=true;
          element['nombrePlan']=cuenta?.nombrePlan;
          element['codigoPlan']=cuenta?.codigoPlan;
          element['tieneHijos']=cuenta?.tieneHijos;
          this.lstMeses.forEach(mes => {
            element[mes.nombre]=element.valorPresupuestoMensual[mes.id-1];
          });
        }
      });
      if(!encontro){
        let itemPresupuesto:any = {
          idPlan:cuenta.idPlan,
          anioPresupuesto:this.anioPresupuesto,
          valorPresupuestoMensual:[0,0,0,0,0,0,0,0,0,0,0,0],
          nombrePlan:cuenta?.nombrePlan,
          codigoPlan:cuenta?.codigoPlan,
          tieneHijos:cuenta?.tieneHijos,
        }
        this.lstMeses.forEach(mes => {
          itemPresupuesto[mes.nombre]=0;
        });
        this.lstPresupuestos.push(itemPresupuesto);
      }
    });
    this.loadingService.hideLoading();
  }

  descargarFormato(){
    let listaPlanes:any[]=[];
    this.lstPlanCuentas.forEach(element => {
      let item:any ={
        Id:element.idPlan,
        Codigo:element.codigoPlan,
        Nombre:element.nombrePlan,
      }
      this.lstMeses.forEach(mes => {
        item[mes.nombre]='';
      });
      listaPlanes.push(item);
    });
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(listaPlanes); 
    const wb: XLSX.WorkBook = XLSX.utils.book_new();  
    XLSX.utils.book_append_sheet(wb, ws, 'formato');  
    XLSX.writeFile(wb, 'formatoPresupuesto.xlsx'); 
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
            this.registrosExcel = arraylist;
          }
        }
        this.loadingService.hideLoading();
    }, 500);
  }

  async cargarInformacion(){
    
    this.loadingService.showLoading();
    setTimeout(() => {
      this.lstMeses.forEach(mes => {
        this.lstPlanCuentas.forEach(element => {
          let planExcel = this.registrosExcel.find(reg=>reg.Id==element.idPlan);
          element[mes.nombre]=planExcel[mes.nombre];
        });
      });
      this.lstPresupuestos = this.lstPlanCuentas;
            $('#planModal').modal('hide');
      this.disableGuardar=false;
      this.loadingService.hideLoading();

    }, 1000);
  }

  async abrirModal(){
    $('#planModal').modal('show');
    $('#planModal').on('shown.bs.modal', async () => {
    });
    this.disableGuardar = true;
  }
  async celdaEditada(plan: any,mes:any,valorNuevo:number) {
    if(this.valorOriginalEditar != valorNuevo){
      let item:IGastoPresupuesto={
        anioGastoPresupuesto:plan.anioPresupuesto,
        mesGastoPresupuesto:mes.id,
        idPlan:plan.idPlan,
        valorGastoMensual:valorNuevo
      }
      let response = await this.presupuestoGastoService.actualizarValorGastoPresupuesto(item,1);
      this.onChangeAnio();
    }
  }
  valorOriginalEditar:number=0;
  celdaOriginal(valorOriginal:number,plan:any){
    this.valorOriginalEditar = valorOriginal;
  }
}
