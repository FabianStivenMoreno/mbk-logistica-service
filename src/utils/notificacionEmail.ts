import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
});

export const enviarNotificacionEmail = async (
  destinatario: string,
  asunto: string,
  mensaje: string
): Promise<void> => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Logística" <noreply@logistica.com>',
    to: destinatario,
    subject: asunto,
    text: mensaje,
  };
  await transporter.sendMail(mailOptions);
};