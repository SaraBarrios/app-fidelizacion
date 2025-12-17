import nodemailer from "nodemailer";

let transporter; // se inicializa solo una vez

const initTransporter = async () => {
  if (!transporter) {
    // Genera una cuenta de prueba automáticamente
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const t = await initTransporter();

  const info = await t.sendMail({
    from: '"Sistema Fidelización" <no-reply@fidelizacion.com>',
    to,
    subject,
    text,
    html,
  });

  console.log("Mensaje enviado: %s", info.messageId);
  console.log("Ver en Ethereal: %s", nodemailer.getTestMessageUrl(info));
};