const express = require("express");
const router = express.Router();
const multer = require("multer");
const verificarRol = require("../middlewares/verificarRol");

const {
  getProductos,
  postProducto,
  putProducto,
  deleteProducto,
  patchProducto,
  patchStock,
  subirImagen,
} = require("../controllers/productos.controller");

// =====================================
// Multer: el archivo se queda en memoria y se manda directo a Cloudinary
// =====================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Solo se permiten imágenes")),
});

// Envuelve multer para devolver errores en JSON (tamaño, tipo de archivo, etc.)
const subirUnaImagen = (req, res, next) => {
  upload.single("imagen")(req, res, (err) => {
    if (err) {
      const mensaje =
        err.code === "LIMIT_FILE_SIZE"
          ? "La imagen supera el máximo de 5 MB"
          : err.message;
      return res.status(400).json({ error: mensaje });
    }
    next();
  });
};

router.get("/", getProductos); // Todos los autenticados
router.post("/", verificarRol([1]), postProducto); // Admin

// IMPORTANTE: esta ruta va antes de las rutas con "/:id"
router.post("/imagen", verificarRol([1, 4]), subirUnaImagen, subirImagen); // Admin, Mecánico

router.put("/:id", verificarRol([1]), putProducto); // Admin
router.patch("/:id", verificarRol([1]), patchProducto); // Admin (edición completa)
router.patch("/:id/stock", verificarRol([1, 4]), patchStock); // Admin, Mecánico (solo stock)
router.delete("/:id", verificarRol([1]), deleteProducto); // Admin

module.exports = router;