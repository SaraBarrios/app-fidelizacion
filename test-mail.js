import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "joyce.zieme@ethereal.email",
    pass: "NrPyuhWJaBrBEc5EjS"
  }
});

async function testMail() {
  try {
    const info = await transporter.sendMail({
      from: '"Sistema Fidelización" <no-reply@sistema.com>',
      to: "cliente@ejemplo.com",
      subject: "Prueba de correo",
      html: "<h1>Hola!</h1><p>Esto es una prueba de Ethereal.</p>"
    });

    console.log("Correo enviado:", info.messageId);
    console.log("Ver en Ethereal:", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error enviando correo:", err);
  }
}

testMail();
