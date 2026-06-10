require("dotenv").config();


const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());

app.use(express.json());

// =====================================
// SUPABASE
// =====================================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// =====================================
// DATOS DE PRUEBA
// =====================================

const usuarios = [
  {
    id: 1,
    nombre: "Juan",
    correo: "juan@gmail.com",
    rol: "Admin",
  },
  {
    id: 2,
    nombre: "Pedro",
    correo: "pedro@gmail.com",
    rol: "Gerente",
  },
];

let mantenimientos = [
  {
    id: 1,
    estado: "Pendiente",
  },
  {
    id: 2,
    estado: "Completada",
  },
  {
    id: 3,
    estado: "En proceso",
  },
];

let clientes = [
  {
    id: 10,
    nombre: "Carlos Ramirez",
    telefono: "3001234567",
  },
];

let empleados = [
  {
    id: 8,
    nombre: "Pedro Lopez",
    cargo: "Mecanico",
  },
];

// =====================================
// NODEMAILER
// =====================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =====================================
// VERIFICAR CONEXIÓN EMAIL
// =====================================

transporter.verify((error) => {

  if (error) {

    console.log("Error en NodeMailer:", error);

  } else {

    console.log("Servidor de correo listo");

  }

});

// =====================================
// ENVIAR CORREO
// =====================================

app.post("/enviar-correo", async (req, res) => {

  try {

    const { email, password, codigo } = req.body;

    if (!email || !codigo) {

      return res.status(400).json({
        error: "Faltan datos obligatorios",
      });

    }

    const info = await transporter.sendMail({

      from: `"Sistema Taller" <${process.env.EMAIL_USER}>`,

      to: email,

      subject: "Datos de acceso",

      html: `
        <div style="font-family: Arial; padding:20px;">
          
          <h2 style="color:#B89B6A;">
            Bienvenido al sistema
          </h2>

          <p>
            Tus credenciales fueron registradas correctamente.
          </p>

          <hr>

          <p>
            <b>Correo:</b> ${email}
          </p>

          <p>
            <b>Contraseña:</b> ${password}
          </p>

          <p>
            <b>Código:</b> ${codigo}
          </p>

          <hr>

          <p style="font-size:12px;color:gray;">
            Este correo fue enviado automáticamente.
          </p>

        </div>
      `,
    });

    console.log("Correo enviado:", info.messageId);

    return res.status(200).json({
      success: true,
      message: "Correo enviado correctamente",
    });

  } catch (error) {

    console.log("Error enviando correo:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });

  }

});

// =====================================
// OBTENER PRODUCTOS
// =====================================

app.get("/productos", async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("id_producto", {
        ascending: true,
      });

    if (error) {

      return res.status(500).json({
        error: error.message,
      });

    }

    res.json(data);

  } catch (error) {

    res.status(500).json({
      error: "Error del servidor",
    });

  }

});

// =====================================
// AGREGAR PRODUCTO
// =====================================

app.post("/productos", async (req, res) => {

  try {

    const {
      nombre_producto,
      descripcion,
      stock_actual,
      imagen,
      activo,
    } = req.body;

    const { data, error } = await supabase
      .from("productos")
      .insert([
        {
          nombre_producto,
          descripcion,
          stock_actual,
          imagen,
          activo,
        },
      ])
      .select();

    if (error) {

      return res.status(400).json({
        error: error.message,
      });

    }

    res.status(201).json({
      success: true,
      data,
    });

  } catch (error) {

    res.status(500).json({
      error: "Error del servidor",
    });

  }

});

// =====================================
// EDITAR PRODUCTO
// =====================================

app.put("/productos/:id", async (req, res) => {

  try {

    const id = parseInt(req.params.id);

    const {
      nombre_producto,
      descripcion,
      stock_actual,
      imagen,
    } = req.body;

    const { data, error } = await supabase
      .from("productos")
      .update({
        nombre_producto,
        descripcion,
        stock_actual,
        imagen,
      })
      .eq("id_producto", id)
      .select();

    if (error) {

      return res.status(500).json({
        error: error.message,
      });

    }

    res.json({
      message: "Producto actualizado",
      data,
    });

  } catch (error) {

    res.status(500).json({
      error: "Error del servidor",
    });

  }

});

// =====================================
// ELIMINAR PRODUCTO
// =====================================

app.delete("/productos/:id", async (req, res) => {

  try {

    const id = parseInt(req.params.id);

    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id_producto", id);

    if (error) {

      return res.status(500).json({
        error: error.message,
      });

    }

    res.json({
      message: "Producto eliminado",
    });

  } catch (error) {

    res.status(500).json({
      error: "Error del servidor",
    });

  }

});

// =====================================
// PATCH PRODUCTO
// =====================================

app.patch("/productos/:id", async (req, res) => {

  try {

    const id = parseInt(req.params.id);

    const { stock_actual } = req.body;

    const { data, error } = await supabase
      .from("productos")
      .update({
        stock_actual,
      })
      .eq("id_producto", id)
      .select();

    if (error) {

      return res.status(500).json({
        error: error.message,
      });

    }

    res.json({
      message: "Stock actualizado",
      data,
    });

  } catch (error) {

    res.status(500).json({
      error: "Error del servidor",
    });

  }

});

// =====================================
// OBTENER MOVIMIENTOS
// =====================================

app.get("/movimientos", async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("movimientos_inventario")
      .select(`
        id_movimiento,
        fecha_movimiento,
        tipo_movimiento,
        cantidad,

        productos:productos!movimientos_inventario_id_producto_fkey (
          id_producto,
          nombre_producto
        ),

        usuarios:usuarios!movimientos_inventario_id_usuario_fkey (
          id_usuario,
          username
        )
      `)
      .order("fecha_movimiento", {
        ascending: false,
      });

    if (error) {

      console.log(error);

      return res.status(500).json({
        error: error.message,
      });

    }

    return res.status(200).json(data);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      error: error.message,
    });

  }

});

// =====================================
// INICIAR SERVIDOR
// =====================================

require("dotenv").config();
const app = require("./app");

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${PORT}`);
});