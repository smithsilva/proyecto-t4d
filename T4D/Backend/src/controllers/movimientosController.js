const postProducto = async (
  req,
  res
) => {

  try {

    const {
      codigo_barras,
      nombre_producto,
      descripcion,
      precio_actual,
      stock_actual,
      unidad_medida,
      id_categoria,
      imagen,
      activo,
      id_usuario,
    } = req.body;

    if (
      !nombre_producto ||
      !precio_actual
    ) {
      return res.status(400).json({
        error:
          "Nombre y precio son obligatorios",
      });
    }

    const producto =
      await agregarProducto({
        codigo_barras,
        nombre_producto,
        descripcion,
        precio_actual,
        stock_actual,
        unidad_medida,
        id_categoria,
        imagen,
        activo,
        id_usuario,
      });

    res.status(201).json(
      producto
    );

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }

};