const supabase =
  require("../config/supabase");

// =====================================
// GET
// =====================================

const obtenerProveedores =
  async () => {
    const { data, error } =
      await supabase
        .from("proveedores")
        .select("*")
        .order(
          "id_proveedor",
          {
            ascending: true,
          }
        );

    if (error) {
      throw error;
    }

    return data;
  };

// =====================================
// POST
// =====================================

const agregarProveedor =
  async (proveedor) => {
    const { data, error } =
      await supabase
        .from("proveedores")
        .insert([proveedor])
        .select();

    if (error) {
      throw error;
    }

    return data;
  };

// =====================================
// PUT
// =====================================

const actualizarProveedor =
  async (
    id,
    proveedor
  ) => {
    const { data, error } =
      await supabase
        .from("proveedores")
        .update(proveedor)
        .eq(
          "id_proveedor",
          id
        )
        .select();

    if (error) {
      throw error;
    }

    return data;
  };

// =====================================
// PATCH
// =====================================

const actualizarParcialProveedor =
  async (
    id,
    datos
  ) => {
    const { data, error } =
      await supabase
        .from("proveedores")
        .update(datos)
        .eq(
          "id_proveedor",
          id
        )
        .select();

    if (error) {
      throw error;
    }

    return data;
  };

// =====================================
// DELETE
// =====================================

const eliminarProveedor =
  async (id) => {
    const { error } =
      await supabase
        .from("proveedores")
        .delete()
        .eq(
          "id_proveedor",
          id
        );

    if (error) {
      throw error;
    }
  };

module.exports = {
  obtenerProveedores,
  agregarProveedor,
  actualizarProveedor,
  actualizarParcialProveedor,
  eliminarProveedor,
};