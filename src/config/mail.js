import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === "true",

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_APP_PASSWORD
  },

  pool: true,
  maxConnections: 5,
  maxMessages: 100
});

export const verifyMailConnection = async () => {
  try {
    await transporter.verify();

    console.log("Email service connected successfully");
  } catch (error) {
    console.error(
      "Email service connection failed:",
      error.message
    );
  }
};

export default transporter;