import PresupuestoForm from "../presupuesto-form";
import { crearPresupuesto } from "./actions";

export default function NuevoPresupuestoPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-slate-900">Nuevo presupuesto</h1>
      <PresupuestoForm accion={crearPresupuesto} textoBoton="Guardar presupuesto" />
    </div>
  );
}
