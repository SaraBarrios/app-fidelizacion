import { transporter } from "./config/mailer.js";

async function testMail() {
  const info = await transporter.sendMail({
    from: '"Sistema Fidelización" <no-reply@sistema.com>',
    to: "cliente@ejemplo.com",
    subject: "Prueba de correo",
    html: "<h1>Hola!</h1><p>Esto es una prueba de Ethereal.</p>"
  });

  console.log("Correo enviado:", info.messageId);
  console.log("URL Vista previa:", nodemailer.getTestMessageUrl(info));
}

testMail();
