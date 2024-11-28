import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppComponent } from 'src/app/app.component';
import { PlanCuentasService } from 'src/app/services/plan-cuentas.service';
import * as SpanishLanguage from 'src/assets/Spanish.json';
import { LoadingService } from 'src/app/services/loading.service';
import { IPlanCuentas } from 'src/app/models/plan-cuentas';
import Swal from 'sweetalert2';
import { ToastrService } from 'src/app/services/toastr.service';
import { Column, GroupInstanceIdCreator } from 'ag-grid-community';

declare var $: any;

@Component({
  selector: 'app-plancuentas',
  templateUrl: './plancuentas.component.html',
  styleUrls: ['./plancuentas.component.css']
})
export class PlancuentasComponent {
  @ViewChild('dataTablePlan', { static: false }) tablePlan!: ElementRef;
  @ViewChild('btnActualizaPlan', { static: true }) btnActualizaPlan!: ElementRef;

  lstPlanCuentas: IPlanCuentas[] = [];
  lstPlanCuentasArbol: any = [];

  dtOptions: any;
  dataTable: any;
  planCuentaForm!: FormGroup;
  isEditing: boolean = false;

  public files: any[] = [];
  public filteredFiles: any[] = [];
  public searchText: string = '';
  cols!: Column[];
  nombreBoton: string = 'Contraer';
  inicialPadre:any='';

  constructor(private loadingService: LoadingService,
    private appComponent: AppComponent, private planCuentasService: PlanCuentasService,
    private fb: FormBuilder, private toastrService: ToastrService, private changeDetector: ChangeDetectorRef
  ) {
    this.appComponent.setTitle('Plan Cuentas');
  }

  ngOnInit() {
    (window as any).EditarPlan = this.EditarPlan.bind(this);
    this.crearPlanForm();
    this.cargarRegistro();
  }

  filterTreeTable() {
    if (!this.searchText) {
      this.filteredFiles = [...this.files];
    } else {
      this.filteredFiles = this.filterNodes(this.files, this.searchText);
    }
  }

  filterNodes(nodes: any[], searchText: string): any[] {
    return nodes
      .map(node => {
        const matches =
          node.data.nombrePlan.toLowerCase().includes(searchText.toLowerCase()) ||
          node.data.codigoPlan.toLowerCase().includes(searchText.toLowerCase());

        if (matches) {
          return node;
        } else if (node.children) {
          const filteredChildren = this.filterNodes(node.children, searchText);
          if (filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
        }
        return null;
      })
      .filter(node => node !== null);
  }

  toggleApplications() {
    this.nombreBoton = this.nombreBoton == 'Contraer' ? 'Expandir' : 'Contraer';
    if (this.filteredFiles && this.filteredFiles.length > 0) {
      const newFiles = this.filteredFiles.map(file => ({
        ...file,
        expanded: !file.expanded
      }));
      this.filteredFiles = newFiles;
    }
  }
  crearPlanForm() {
    this.planCuentaForm = this.fb.group({
      idPlan: [0],
      idPadre: [''],
      codigoPlan: ['', [Validators.required]],
      nombrePlan: ['', [Validators.required]],
      nivelPlan: [''],
      estaActivo:[true]
    });
  }

  async cargarRegistro() {
    this.lstPlanCuentas = await this.planCuentasService.obtenerPlanCuentas();
    this.files = await this.planCuentasService.obtenerPlanCuentasArbol();
    this.filteredFiles = [...this.files];
    this.expandNodes(this.filteredFiles);
  }

  AbrirModal(rowData: any, esEdicion: boolean) {
    this.isEditing = esEdicion;
    if (!esEdicion) {
      this.agregarPlan(rowData);
    } else {
      this.EditarPlan(rowData['idPlan']);
    }
    $('#planModal').modal('show');
  }
  agregarPlan(rowData:any){

    let hijos = this.lstPlanCuentas.filter(element=>element.idPadre==rowData.idPlan);
    let idHijo =this.idSiguienteHijo(hijos);
    this.inicialPadre = rowData.codigoPlan;
    this.planCuentaForm = this.fb.group({
      idPlan: ['0'],
      idPadre: [rowData.idPlan],
      codigoPlan: [idHijo+'.', [Validators.required]],
      nombrePlan: [rowData.nombrePlan, [Validators.required]],
      nivelPlan: [Number(rowData.nivelPlan)+1],
      estaActivo:[true]
    });
  }
  idSiguienteHijo(hijos:any[]){
    hijos.forEach(element => {
      let partes = element.codigoPlan.split('.');
      element['indexHijo']=partes[partes.length-2];
    });

    let numeroIdMaximo =0;
    if(hijos.length>0){
      numeroIdMaximo = Math.max(...hijos.map(obj => Number(obj.indexHijo))); 
    }

    if(numeroIdMaximo+1<10){
      return '0'+(numeroIdMaximo+1);
    }else{
      return numeroIdMaximo+1;
    }
   
  }

  OnSubmit(): void {
    if (this.isEditing) {
      this.ActualizarPlan();
    } else {
      this.CrearPlan();
    }
  }

  async CrearPlan() {
    try {
      this.loadingService.showLoading();
      if (this.planCuentaForm.valid) {
        try {
          const planData: IPlanCuentas = this.planCuentaForm.value;
          planData.codigoPlan = this.inicialPadre+this.planCuentaForm.value.codigoPlan;
          const mensajeInsercion = await this.planCuentasService.insertarPlan(planData);
          Swal.fire({
            text: mensajeInsercion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al agregar el plan de cuentas', error.message);
          } else {
            this.toastrService.error('Error al agregar el plan de cuentas', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.planCuentaForm);
        this.toastrService.error('Error al agregar el plan de cuentas', 'No se llenaron todos los campos necesarios.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al agregar el plan de cuentas', error.message);
      } else {
        this.toastrService.error('Error al agregar el plan de cuentas', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async ActualizarPlan() {
    try {
      this.loadingService.showLoading();
      if (this.planCuentaForm.valid) {
        try {
          const planData: IPlanCuentas = this.planCuentaForm.value;
          planData.codigoPlan = this.planCuentaForm.get('codigoPlan')?.value;
          const mensajeActualizacion = await this.planCuentasService.actualizarPlan(planData.idPlan, planData);
          Swal.fire({
            text: mensajeActualizacion,
            icon: 'success',
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          if (error instanceof Error) {
            this.toastrService.error('Error al actualizar la marca', error.message);
          } else {
            this.toastrService.error('Error al actualizar la marca', 'Solicitar soporte al departamento de TI.');
          }
        }
      } else {
        this.appComponent.validateAllFormFields(this.planCuentaForm);
        this.toastrService.error('Error al actualizar la marca', 'No se llenaron todos los campos necesarios.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastrService.error('Error al actualizar la marca', error.message);
      } else {
        this.toastrService.error('Error al actualizar la marca', 'Solicitar soporte al departamento de TI.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  EditarPlan(idPlan: number) {
    this.inicialPadre='';
    const planActualizar = this.lstPlanCuentas.find(x => x.idPlan == idPlan);
    this.planCuentaForm = this.fb.group({
      idPlan: [planActualizar!.idPlan],
      nivelPlan: [planActualizar!.nivelPlan],
      nombrePlan: [planActualizar!.nombrePlan, [Validators.required]],
      codigoPlan: [planActualizar!.codigoPlan, [Validators.required]],
      idPadre: [planActualizar!.idPadre],
      estaActivo:[true]
    });
    this.planCuentaForm.get('codigoPlan')?.disable();

    this.changeDetector.detectChanges();
    //this.btnActualizaPlan.nativeElement.click();
  }

  GetSpanishLanguage() {
    return SpanishLanguage;
  }

  expandNodes(nodes: any[]): void {
    nodes.forEach(node => {
      node.expanded = true;
      if (node.children && node.children.length) {
        this.expandNodes(node.children);
      }
    });
  }
}
