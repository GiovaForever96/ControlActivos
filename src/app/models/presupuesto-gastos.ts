export interface IMesGasto {
    idMes: number,
    nombreMes?: string,
}

export interface IGastoMensual {
    AnioGastoPresupuesto : number,
    MesGastoPresupuesto ?: number,
    IdPlan? : number,
    ValorGastoMensual  ?: number
}

export interface IGastosRespuesta {
    informacionGastoPresupuesto : IGastoMensual[],
    listaMesesGastos : IMesGasto[],
}
