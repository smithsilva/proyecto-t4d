const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  // Normaliza espacios múltiples entre "Bearer" y el token,
  // y no le importa mayúsculas/minúsculas en "Bearer".
  const partes = authHeader.trim().split(/\s+/); // separa por cualquier cantidad de espacios
  const esquema = partes[0];
  const token = partes[1];

  if (!token || esquema.toLowerCase() !== "bearer") {
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