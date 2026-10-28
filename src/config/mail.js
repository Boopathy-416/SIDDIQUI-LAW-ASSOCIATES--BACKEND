// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: process.env.MAIL_HOST,
//   port: Number(process.env.MAIL_PORT),
//   secure: process.env.MAIL_SECURE === "true",

//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_APP_PASSWORD
//   },

//   pool: true,
//   maxConnections: 5,
//   maxMessages: 100
// });

// export const verifyMailConnection = async () => {
//   try {
//     await transporter.verify();

//     console.log("Email service connected successfully");
//   } catch (error) {
//     console.error(
//       "Email service connection failed:",
//       error.message
//     );
//   }
// };

// export default transporter;




import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtpout.secureserver.net",
  port: Number(process.env.MAIL_PORT || 465),
  secure: process.env.MAIL_SECURE !== "false",

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_APP_PASSWORD,
  },

  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

export const verifyMailConnection = async () => {
  try {
    await transporter.verify();
    console.log("Titan SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("Email service connection failed:", error.message);
    return false;
  }
};

export default transporter;
