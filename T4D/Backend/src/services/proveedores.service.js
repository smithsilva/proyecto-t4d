const supabase = require("../config/supabase");

// OBTENER TODOS
const obtenerProveedoresService = async () => {
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .order("id_proveedor", { ascending: true });

  if (error) throw error;

  return data;
};

// CREAR
const crearProveedorService = async (proveedor) => {
  const { data, error } = await supabase
    .from("proveedores")
    .insert([proveedor])
    .select();

  if (error) throw error;

  return data;
};

// ACTUALIZAR
const actualizarProveedorService = async (id, proveedor) => {
  const { data, error } = await supabase
    .from("proveedores")
    .update(proveedor)
    .eq("id_proveedor", id)
    .select();

  if (error) throw error;

  return data;
};

// ELIMINAR
const eliminarProveedorService = async (id) => {
  const { error } = await supabase
    .from("proveedores")
    .delete()
    .eq("id_proveedor", id);

  if (error) throw error;

  return true;
};

module.exports = {
  obtenerProveedoresService,
  crearProveedorService,
  actualizarProveedorService,
  eliminarProveedorService,
};