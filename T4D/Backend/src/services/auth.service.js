const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");
const transporter = require("../config/nodemailer");
const crypto = require("crypto");

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

function generarToken() {
  return crypto.randomBytes(32).toString("hex");
}

// ── SOLICITAR RESTABLECIMIENTO (envía link) ──
const forgotPassword = async (email) => {
  console.log("Buscando usuario con email:", email);

  const { data: usuarioBD, error } = await supabase
    .from("usuarios")
    .select("id_usuario, email, username")
    .eq("email", email)
    .single();

  console.log("Resultado búsqueda:", usuarioBD, error);

  if (error || !usuarioBD) {
    console.log("No se encontró el usuario, no se envía correo");
    return { mensaje: "Si el correo existe, se ha enviado un enlace de recuperación" };
  }

  const token = generarToken();
  const expira = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: errorUpdate } = await supabase
    .from("usuarios")
    .update({ reset_code: token, reset_code_expires: expira })
    .eq("id_usuario", usuarioBD.id_usuario);

  console.log("Error al actualizar reset_code:", errorUpdate);

  if (errorUpdate) throw new Error("No se pudo generar el enlace");

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  console.log("Link de recuperación generado:", resetLink);

  await transporter.sendMail({
    from: `"Technology For Defense" <${process.env.EMAIL_USER}>`,
    to: usuarioBD.email,
    subject: "Restablecer contraseña - T4D",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#8B6914;">Technology For Defense S.A.S.</h2>
        <p>Hola <b>${usuarioBD.username}</b>,</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña. Válido por 15 minutos:</p>
        <div style="text-align:center; margin:24px 0;">
          <a href="${resetLink}" style="background:#1A2336; color:#B89B6A; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
            Restablecer contraseña
          </a>
        </div>
        <p style="color:#666; font-size:13px;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br>${resetLink}</p>
        <p style="margin-top:16px; color:#666;">Si no solicitaste esto, ignora este correo.</p>
      </div>
    `,
  });

  console.log("Correo enviado a:", usuarioBD.email);

  return { mensaje: "Si el correo existe, se ha enviado un enlace de recuperación" };
};

// ── RESTABLECER CONTRASEÑA (con token) ──
const resetPassword = async (token, nuevaPassword) => {
  const { data: usuarioBD, error } = await supabase
    .from("usuarios")
    .select("id_usuario, email, reset_code, reset_code_expires")
    .eq("reset_code", token)
    .single();

  if (error || !usuarioBD) {
    throw new Error("Enlace inválido o expirado");
  }

  const ahora = new Date();
  const expira = new Date(usuarioBD.reset_code_expires);

  if (ahora > expira) {
    throw new Error("Enlace inválido o expirado");
  }

  // Buscar el usuario en Supabase Auth por email (Admin API)
  const { data: listaUsuarios, error: errorLista } = await supabase.auth.admin.listUsers();
  if (errorLista) throw new Error("Error al buscar el usuario en Auth");

  const authUser = listaUsuarios.users.find(
    (u) => u.email?.toLowerCase() === usuarioBD.email.toLowerCase()
  );

  if (!authUser) throw new Error("Usuario no encontrado en el sistema de autenticación");

  const { error: errorUpdatePass } = await supabase.auth.admin.updateUserById(
    authUser.id,
    { password: nuevaPassword }
  );

  if (errorUpdatePass) throw new Error("No se pudo actualizar la contraseña");

  // Limpiar el token usado
  await supabase
    .from("usuarios")
    .update({ reset_code: null, reset_code_expires: null })
    .eq("id_usuario", usuarioBD.id_usuario);

  return { mensaje: "Contraseña actualizada correctamente" };
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
};