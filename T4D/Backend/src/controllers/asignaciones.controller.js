const {
  obtenerAsignaciones,
} = require(
  "../services/asignaciones.service"
);

const getAsignaciones =
  async (req, res) => {

    try {

      const asignaciones =
        await obtenerAsignaciones();

      res.json(asignaciones);

    } catch (error) {

      res.status(500).json({
        error: error.message,
      });

    }
};

module.exports = {
  getAsignaciones,
};