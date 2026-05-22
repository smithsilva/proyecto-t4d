const supabase = require("../config/supabase");

// ======================================
// OBTENER ROLES
// ======================================

const obtenerRoles = async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("id_rol", {
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

module.exports = {
  obtenerRoles,
};