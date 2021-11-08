const nodemailer = require("nodemailer");

const sendMail = async ({ to, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Duc Dang <dangminhduc@gmail.com>",
    to,
    subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
