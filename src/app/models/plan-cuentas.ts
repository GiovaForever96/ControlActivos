export interface IPlanCuentas {
    idPlan: number,
    idPadre?: number,
    nombrePlan: string,
    nivelPlan?:string,
    estadoActivo?:boolean,
    codigoPlan?:string,
    tieneHijos?:boolean
}

export interface IPlanCuentasPresupuesto {
    idPlan: number,
    anioPresupuesto?: number,
    valorPresupuestoMensual: number[]
}

export interface IGastoPresupuesto {
    idPlan: number,
    anioGastoPresupuesto?: number,
    mesGastoPresupuesto?: number
    valorGastoMensual?: number
}

