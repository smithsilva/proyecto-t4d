const { login, forgotPassword, resetPassword } = require("../services/auth.service");

// =====================================
// POST /auth/login
// =====================================
const postLogin = async (req, res) => {
  try {
    const { email, password, codigo } = req.body;

    if (!email || !password || !codigo) {
      return res.status(400).json({ error: "Faltan campos: email, password o codigo" });
    }

    const { usuario, token } = await login(email, password, codigo);

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      usuario,
      token,
    });
  } catch (error) {
    console.error("ERROR LOGIN:", error);
    res.status(401).json({ error: error.message });
  }
};

// =====================================
// POST /auth/forgot-password
// =====================================
const postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "El correo es requerido" });
    }

    const resultado = await forgotPassword(email);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("ERROR FORGOT PASSWORD:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

// =====================================
// POST /auth/reset-password
// =====================================
const postResetPassword = async (req, res) => {
  try {
    const { token, nuevaPassword } = req.body;
    if (!token || !nuevaPassword) {
      return res.status(400).json({ error: "Faltan campos: token o nuevaPassword" });
    }
    if (nuevaPassword.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const resultado = await resetPassword(token, nuevaPassword);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("ERROR RESET PASSWORD:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  postLogin,
  postForgotPassword,
  postResetPassword,
};