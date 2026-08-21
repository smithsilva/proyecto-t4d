const supabase = require("../config/supabase");

const obtenerAsignaciones = async () => {
  const { data: asignaciones, error } = await supabase
    .from("asignaciones_tareas")
    .select("*")
    .order("fecha_asignacion", { ascending: false });

  if (error) {
    console.error("Error asignaciones:", error);
    throw error;
  }

  const ids = [...new Set(asignaciones.map((a) => a.id_mecanico))];

  const { data: usuarios, error: errorUsuarios } = await supabase
    .from("usuarios")
    .select("id_usuario, username")
    .in("id_usuario", ids);

  if (errorUsuarios) {
    console.error("Error usuarios:", errorUsuarios);
    throw errorUsuarios;
  }

  const usuariosMap = Object.fromEntries(
    usuarios.map((u) => [u.id_usuario, u])
  );

  return asignaciones.map((a) => ({
    ...a,
    usuarios: usuariosMap[a.id_mecanico] || null,
  }));
};

module.exports = { obtenerAsignaciones };