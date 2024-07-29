import { IMarcaActivo } from "./marca-activo";

export interface IModeloActivo {
    idModelo: number,
    nombreModelo: string,
    idMarca: number,
    estaActivo: boolean,
    marca?: IMarcaActivo
}
