const nodemailer = require("nodemailer");
const getAdminToken = async (email, token, name) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.elasticemail.com",
    port: 2525,
    secure: false,
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });
  await transporter.sendMail({
    from:`"${"Shopme Online shopping"}" <${process.env.email}>`,
    to: email,
    subject: `Signup token`,
    text: `Hello ${name} your token is below`,
    html: `<b>${token}</b>`,
  });
};
module.exports = getAdminToken;
