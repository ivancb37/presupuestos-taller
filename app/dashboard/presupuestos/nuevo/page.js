import NuevoPresupuestoForm from "./nuevo-presupuesto-form";

export default function NuevoPresupuestoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Nuevo presupuesto</h1>
      <NuevoPresupuestoForm />
    </div>
  );
}
