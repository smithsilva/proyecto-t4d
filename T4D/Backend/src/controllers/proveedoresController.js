import { supabase } from "../config/supabase.js";

export const obtenerProveedores = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("proveedores")
      .select("*");

    if (error) throw error;

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({
      mensaje: error.message
    });
  }
};

export const crearProveedor = async (req, res) => {
  try {

    const {
      nit,
      nombre,
      telefono,
      correo,
      direccion
    } = req.body;

    const { data, error } = await supabase
      .from("proveedores")
      .insert([
        {
          nit,
          nombre,
          telefono,
          correo,
          direccion
        }
      ]);

    if (error) throw error;

    res.status(201).json({
      mensaje: "Proveedor creado",
      data
    });

  } catch (error) {
    res.status(500).json({
      mensaje: error.message
    });
  }
};

export const actualizarProveedor = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      nit,
      nombre,
      telefono,
      correo,
      direccion
    } = req.body;

    const { data, error } = await supabase
      .from("proveedores")
      .update({
        nit,
        nombre,
        telefono,
        correo,
        direccion
      })
      .eq("id", id);

    if (error) throw error;

    res.json({
      mensaje: "Proveedor actualizado",
      data
    });

  } catch (error) {
    res.status(500).json({
      mensaje: error.message
    });
  }
};

export const eliminarProveedor = async (req, res) => {
  try {

    const { id } = req.params;

    const { error } = await supabase
      .from("proveedores")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({
      mensaje: "Proveedor eliminado"
    });

  } catch (error) {
    res.status(500).json({
      mensaje: error.message
    });
  }
};