const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verifica la conexión al arrancar el servidor
transporter.verify((error, success) => {
  if (error) {
    console.log("Error configurando nodemailer:", error.message);
  } else {
    console.log("Servidor de correo listo para enviar mensajes");
  }
});

module.exports = transporter;