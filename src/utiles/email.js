import nodemailer from "nodemailer";

// Crear transporte con Ethereal
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "joyce.zieme@ethereal.email",  // reemplazá con tu usuario
    pass: "NrPyuhWJaBrBEc5EjS",          // reemplazá con tu contraseña
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  const info = await transporter.sendMail({
    from: '"Sistema Fidelización" <no-reply@fidelizacion.com>',
    to,
    subject,
    text,
    html,
  });

  console.log("Mensaje enviado: %s", info.messageId);
  console.log("Ver en Ethereal: %s", nodemailer.getTestMessageUrl(info));
};
