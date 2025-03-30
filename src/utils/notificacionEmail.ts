import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../services/logger/loggerService';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const enviarNotificacionEmail = async (
  destinatario: string,
  asunto: string,
  mensaje: string
): Promise<void> => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: destinatario,
    subject: asunto,
    text: mensaje,
  };
  await transporter.sendMail(mailOptions);
};