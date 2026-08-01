const { login } = require("../services/auth.service");

// =====================================
// POST /login
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

    res.status(401).json({
      error: error.message,
    });
  }
};

module.exports = {
  postLogin,
};