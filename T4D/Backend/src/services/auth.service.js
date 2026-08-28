const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const login = async (email, password, codigo) => {
  console.log("========== LOGIN ==========");
  console.log("Email:", email);

  // 1. Validar contraseña con Supabase Auth (no con la tabla "usuarios")
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.log("Error de autenticación Supabase:", authError.message);
    throw new Error("Correo o contraseña incorrectos");
  }

  // 2. Traer datos adicionales de la tabla "usuarios"
  const { data: usuarioBD, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !usuarioBD) {
    throw new Error("Usuario no encontrado");
  }

  if (!usuarioBD.activo) {
    throw new Error("Cuenta deshabilitada, contacta al administrador");
  }

  if (usuarioBD.codigo !== codigo) {
    throw new Error("Código de verificación incorrecto");
  }

  const token = jwt.sign(
    {
      id_usuario: usuarioBD.id_usuario,
      email: usuarioBD.email,
      id_rol: usuarioBD.id_rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const { codigo: _cod, ...usuarioSinSensibles } = usuarioBD;

  return { usuario: usuarioSinSensibles, token };
};

module.exports = {
  login,
};