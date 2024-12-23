export interface IMesGasto {
    idMes: number,
    nombreMes?: string,
}

export interface IGastoMensual {
    anioGastoPresupuesto: number,
    mesGastoPresupuesto?: number,
    idPlan?: number,
    valorGastoMensual?: number
}

export interface IGastosRespuesta {
    informacionGastoPresupuesto: IGastoMensual[],
    listaMesesGastos: IMesGasto[],
}

export interface IInformacionGastoPresupuestoGrafico {
    informacionGastosIngresados: number[],
    informacionPresupuestoIngresados: number[]
}

export interface IInformacionGastoPresupuestoMesCuentaGrafico {
    informacionCuentas: string[],
    informacionGastosIngresados: number[],
    informacionPresupuestoIngresados: number[],
}