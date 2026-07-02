const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // formato: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expirado, inicia sesión de nuevo" });
      }
      return res.status(403).json({ error: "Token inválido" });
    }

    req.usuario = decoded; // { id_usuario, email, id_rol, iat, exp }
    next();
  });
};

module.exports = verificarToken;