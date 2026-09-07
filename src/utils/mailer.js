import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: Number(process.env.MAIL_PORT) === 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

export const sendTicketConfirmationEmail = async ({
  to,
  event,
  ticket,
}) => {
  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `Confirmación de inscripción - ${event.title}`,
    html: `
      <h2>Inscripción confirmada</h2>

      <p>Tu inscripción al evento fue confirmada correctamente.</p>

      <p><strong>Evento:</strong> ${event.title}</p>
      <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleString()}</p>
      <p><strong>Lugar:</strong> ${event.location}</p>
      <p><strong>Cantidad:</strong> ${ticket.quantity}</p>
      <p><strong>Código de reserva:</strong> ${ticket.reservationCode}</p>
    `,
  });

  console.log("Email enviado:", info.messageId);

  const previewUrl = nodemailer.getTestMessageUrl(info);

  if (previewUrl) {
    console.log("Vista previa del email:", previewUrl);
  }

  return info;
};