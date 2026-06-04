const supabase = require("../config/supabase");

const obtenerUsuarios = async () => {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*");

  if (error) throw error;

  return data;
};

module.exports = {
  obtenerUsuarios,
};