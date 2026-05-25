// =====================================
// OBTENER PROVEEDORES
// GET
// =====================================

app.get("/proveedores", async (req, res) => {
  try {

    const { data, error } = await supabase
      .from("proveedores")
      .select("*")
      .order("id_proveedor", {
        ascending: true,
      });

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    return res.status(200).json(data);

  } catch (error) {

    return res.status(500).json({
      error: "Error del servidor",
    });
  }
});

// =====================================
// AGREGAR PROVEEDOR
// POST
// =====================================

app.post("/proveedores", async (req, res) => {
  try {

    const {
      nombre_proveedor,
      nit,
      telefono,
      correo,
      direccion,
    } = req.body;

    const { data, error } = await supabase
      .from("proveedores")
      .insert([
        {
          nombre_proveedor,
          nit,
          telefono,
          correo,
          direccion,
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      data,
    });

  } catch (error) {

    return res.status(500).json({
      error: "Error del servidor",
    });
  }
});

// =====================================
// EDITAR PROVEEDOR
// PUT
// =====================================

app.put("/proveedores/:id", async (req, res) => {
  try {

    const id = parseInt(req.params.id);

    const {
      nombre_proveedor,
      nit,
      telefono,
      correo,
      direccion,
    } = req.body;

    const { data, error } = await supabase
      .from("proveedores")
      .update({
        nombre_proveedor,
        nit,
        telefono,
        correo,
        direccion,
      })
      .eq("id_proveedor", id)
      .select();

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Proveedor actualizado",
      data,
    });

  } catch (error) {

    return res.status(500).json({
      error: "Error del servidor",
    });
  }
});

// =====================================
// ELIMINAR PROVEEDOR
// DELETE
// =====================================

app.delete("/proveedores/:id", async (req, res) => {
  try {

    const id = parseInt(req.params.id);

    const { error } = await supabase
      .from("proveedores")
      .delete()
      .eq("id_proveedor", id);

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Proveedor eliminado",
    });

  } catch (error) {

    return res.status(500).json({
      error: "Error del servidor",
    });
  }
});