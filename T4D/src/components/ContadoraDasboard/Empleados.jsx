import EmpleadosBase from "../AdminDasboard/Empleados";

// La Contadora solo puede ver los empleados
export default function Empleados() {
  return <EmpleadosBase esAdmin={false} soloLectura />;
}