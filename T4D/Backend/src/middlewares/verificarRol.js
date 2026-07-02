const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    const { id_rol } = req.usuario; // viene de verificarToken

    if (!rolesPermitidos.includes(id_rol)) {
      return res.status(403).json({
        error: "No tienes permisos para esta acción",
      });
    }

    next();
  };
};

module.exports = verificarRol;