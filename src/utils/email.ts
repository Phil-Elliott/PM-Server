import nodeMailer, { Transporter } from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions) => {
  // 1) Create a transporter
  const transporter: Transporter = nodeMailer.createTransport(
    `smtps://${encodeURIComponent(
      process.env.EMAIL_USERNAME!
    )}:${encodeURIComponent(process.env.EMAIL_PASSWORD!)}@${
      process.env.EMAIL_HOST
    }:${process.env.EMAIL_PORT}`
  );

  // 2) Define the email options
  const mailOptions = {
    from: "Jonas Schmedtmann <hello@phil.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
