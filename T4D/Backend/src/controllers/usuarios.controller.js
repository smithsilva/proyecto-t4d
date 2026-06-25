const supabase = require("../config/supabase");

// ======================================
// OBTENER USUARIOS
// ======================================

const obtenerUsuarios = async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("usuarios")
      .select(`
        *,
        roles (
          id_rol,
          nombre_rol,
          descripcion,
          nivel_acceso
        )
      `)
      .order("id_usuario", {
        ascending: true,
      });

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(data);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }

};

// ======================================
// CREAR USUARIO
// ======================================

const crearUsuario = async (req, res) => {

  try {

    const {
      username,
      email,
      password,
      id_rol,
      codigo,
    } = req.body;

    // ==============================
    // CREAR USUARIO EN AUTH
    // ==============================

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({

        email,
        password,

        email_confirm: true,

      });

    if (authError) {

      return res.status(400).json({
        error: authError.message,
      });

    }

    // ==============================
    // GUARDAR EN TABLA USUARIOS
    // ==============================

    const { data, error } = await supabase
      .from("usuarios")
      .insert([
        {
          username,
          email,
          id_rol,
          codigo,
          auth_id: authData.user.id,
        },
      ])
      .select();

    if (error) {

      return res.status(400).json({
        error: error.message,
      });

    }

    res.status(201).json({
      success: true,
      data,
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }

};

// ======================================
// EDITAR USUARIO
// ======================================

const editarUsuario = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      username,
      email,
      id_rol,
      activo,
      codigo,
    } = req.body;

    const { data, error } = await supabase
      .from("usuarios")
      .update({
        username,
        email,
        id_rol,
        activo,
        codigo,
      })
      .eq("id_usuario", id)
      .select();

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json({
      success: true,
      data,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// ======================================
// ELIMINAR USUARIO
// ======================================

const eliminarUsuario = async (req, res) => {

  try {

    const id = req.params.id;

    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id_usuario", id);

    if (error) {

      return res.status(400).json({
        error: error.message,
      });

    }

    res.json({
      success: true,
      message: "Usuario eliminado",
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }

};



const actualizarParcialUsuario = async (
  req,
  res
) => {
  try {
    const id = req.params.id;

    const { data, error } = await supabase
      .from("usuarios")
      .update(req.body)
      .eq("id_usuario", id)
      .select();

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json({
      success: true,
      data,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  editarUsuario,
  actualizarParcialUsuario,
  eliminarUsuario,
};