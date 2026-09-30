import nodemailer from 'nodemailer';
import mailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();

const transporter = mailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.STMP_USER,
    pass: process.env.STMP_PASS,
  },
})  

try {
  const info = await transporter.sendMail({
    from: '"Equipe Trocaticket" <trocaticketprojeto@gmail.com>',
    to: "juliadamassio@gmail.com",
    subject: "oieee",
    text: "oie?",
    html: "<h1>Isso é um html👌<h1>",
  });

  console.log("Mensagem enviada", info.messageID)
  console.log("Prévia da url", nodemailer.getTestMessageUrl(info))

} catch (err) {
  console.log("nao foi possivel mandar essa mensagem", err)
}