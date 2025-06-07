import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
 host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: "amiraoumaymahayet@gmail.com",
    pass: "aorr erns kijp ouaj", // mot de passe d'application
  },
  tls: {
    rejectUnauthorized: false, // ✅ Ajout pour ignorer les certificats non signés
  },
});


  
