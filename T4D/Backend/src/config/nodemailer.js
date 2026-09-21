const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ⚠️ Solo para desarrollo local (ver explicación abajo)
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Error configurando nodemailer:", error.message);
  } else {
    console.log("Servidor de correo listo para enviar mensajes");
  }
});

module.exports = transporter;