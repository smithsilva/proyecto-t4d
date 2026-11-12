const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../config/db");
const transporter = require("../config/nodemailer");

const quitarSensibles = (usuario) => {
  const { codigo, password_hash, reset_code, reset_code_expires, ...resto } = usuario;
  return resto;
};

const login = async (email, password, codigo) => {
  console.log("========== LOGIN ==========");
  console.log("Email:", email);

  const { rows } = await pool.query(
    "SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [email]
  );
  const usuarioBD = rows[0];

  // Mismo mensaje para "no existe" y "clave incorrecta"
  if (!usuarioBD || !usuarioBD.password_hash) {
    throw new Error("Correo o contraseña incorrectos");
  }

  const claveOk = await bcrypt.compare(password, usuarioBD.password_hash);
  if (!claveOk) {
    throw new Error("Correo o contraseña incorrectos");
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

  return { usuario: quitarSensibles(usuarioBD), token };
};

const generarToken = () => crypto.randomBytes(32).toString("hex");

// ── SOLICITAR RESTABLECIMIENTO (envía link) ──
const forgotPassword = async (email) => {
  const respuesta = {
    mensaje: "Si el correo existe, se ha enviado un enlace de recuperación",
  };

  const { rows } = await pool.query(
    "SELECT id_usuario, email, username FROM usuarios WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [email]
  );
  const usuarioBD = rows[0];

  if (!usuarioBD) {
    console.log("No se encontró el usuario, no se envía correo");
    return respuesta;
  }

  const token = generarToken();
  const expira = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  try {
    await pool.query(
      "UPDATE usuarios SET reset_code = $1, reset_code_expires = $2 WHERE id_usuario = $3",
      [token, expira, usuarioBD.id_usuario]
    );
  } catch (err) {
    console.error("Error al actualizar reset_code:", err.message);
    throw new Error("No se pudo generar el enlace");
  }

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
  return respuesta;
};

// ── RESTABLECER CONTRASEÑA (con token) ──
const resetPassword = async (token, nuevaPassword) => {
  const { rows } = await pool.query(
    "SELECT id_usuario, reset_code_expires FROM usuarios WHERE reset_code = $1 LIMIT 1",
    [token]
  );
  const usuarioBD = rows[0];

  if (!usuarioBD) {
    throw new Error("Enlace inválido o expirado");
  }

  if (new Date() > new Date(usuarioBD.reset_code_expires)) {
    throw new Error("Enlace inválido o expirado");
  }

  const hash = await bcrypt.hash(nuevaPassword, 10);

  await pool.query(
    "UPDATE usuarios SET password_hash = $1, reset_code = NULL, reset_code_expires = NULL WHERE id_usuario = $2",
    [hash, usuarioBD.id_usuario]
  );

  return { mensaje: "Contraseña actualizada correctamente" };
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
};
