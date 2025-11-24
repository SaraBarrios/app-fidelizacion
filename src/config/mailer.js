import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, 
  auth: {
    user: "joyce.zieme@ethereal.email",
    pass: "NrPyuhWJaBrBEc5EjS"
  }
});
