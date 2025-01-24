export interface IPlanCuentas {
    idPlan: number,
    idPadre?: number,
    nombrePlan: string,
    nivelPlan?: string,
    estadoActivo?: boolean,
    codigoPlan?: string,
    tieneHijos?: boolean
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
    valorGastoMensual?: number,
    usuarioModificacion?: string
}

export interface IHistorialGastoPresupuesto {
    fechaModificacion: Date,
    usuario: string,
    mesModificacion: string,
    montoAnterior: number,
    montoActual: number,
    variacionMonto: number
}

export interface IIndicadorFinanciero {
    idIndicadorFinanciero: number,
    anioIndicador: number,
    mesIndicador: number,
    montoIndicador: number,
    idCuentaPlan: number,
    planCuenta?: IPlanCuentas
}

export interface IDetallePlanCuenta {
    idDetallePlan: number,
    descripcionDetalle: string,
    montoDetalle: number,
    estaActivo: boolean,
    fechaHoraDetalle: Date,
    usuarioDetalle: string,
    idPlanDetalle: number,
    planCuenta: IPlanCuentas,
    mes: number
}