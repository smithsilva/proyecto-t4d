const supabase =
  require("../config/supabase");

const obtenerSucursalesService =
  async () => {
    const { data, error } =
      await supabase
        .from("sucursales")
        .select("*")
        .order("id_sucursal", {
          ascending: true,
        });

    if (error) throw error;

    return data;
  };

const obtenerSucursalPorIdService =
  async (id) => {
    const { data, error } =
      await supabase
        .from("sucursales")
        .select("*")
        .eq("id_sucursal", id)
        .single();

    if (error) throw error;

    return data;
  };

const crearSucursalService =
  async (sucursal) => {
    const { data, error } =
      await supabase
        .from("sucursales")
        .insert([sucursal])
        .select();

    if (error) throw error;

    return data;
  };

const actualizarSucursalService =
  async (
    id,
    sucursal
  ) => {
    const { data, error } =
      await supabase
        .from("sucursales")
        .update(sucursal)
        .eq("id_sucursal", id)
        .select();

    if (error) throw error;

    return data;
  };

const eliminarSucursalService =
  async (id) => {
    const { error } =
      await supabase
        .from("sucursales")
        .delete()
        .eq("id_sucursal", id);

    if (error) throw error;

    return true;
  };

module.exports = {
  obtenerSucursalesService,
  obtenerSucursalPorIdService,
  crearSucursalService,
  actualizarSucursalService,
  eliminarSucursalService,
};