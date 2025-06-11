const { transporter } = require("./Email.confiq.js");
const { Verification_Email_Template, Welcome_Email_Template } = require("./EmailTemplate.js");

const sendVerificationEmail = async (email, verificationCode) => {
    try {
        const response = await transporter.sendMail({
            from: '"JobMatch" <amiraoumaymahayet@gmail.com>',
            to: email,
            subject: "Verify your Email",
            text: "Verify your Email",
            html: Verification_Email_Template.replace("{verificationCode}", verificationCode)
        });
        console.log('Email send Successfully', response);
    } catch (error) {
        console.log('Email error', error);
    }
};

const sendWelcomeEmail = async (email, name) => {
    try {
        const response = await transporter.sendMail({
            from: '"JobMatch" <amiraoumaymahayet@gmail.com>',
            to: email,
            subject: "Welcome Email",
            text: "Welcome Email",
            html: Welcome_Email_Template.replace("{name}", name)
        });
        console.log('Email send Successfully', response);
    } catch (error) {
        console.log('Email error', error);
    }
};

const sendConfirmationEmail = async (email, offerTitle) => {
    try {
        const htmlContent = `
            <p>Bonjour,</p>
            <p>Merci d'avoir postulé à l'offre <strong>${offerTitle}</strong>.</p>
            <p>Nous vous contacterons prochainement pour la suite du processus.</p>
            <br/>
            <p>L'équipe JobMatch</p>
        `;

        const response = await transporter.sendMail({
            from: '"JobMatch" <amiraoumaymahayet@gmail.com>',
            to: email,
            subject: "Confirmation de votre candidature",
            text: "Merci pour votre candidature.",
            html: htmlContent,
        });

        console.log("Email de confirmation envoyé avec succès", response);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email de confirmation :", error);
    }
};



// ✅ Email d'acceptation
const sendAcceptanceEmail = async (email, name, offerTitle) => {
    try {
        const htmlContent = `
            <p>Bonjour ${name},</p>
            <p>Félicitations ! Votre candidature pour le poste <strong>${offerTitle}</strong> a été acceptée.</p>
            <p>Nous reviendrons vers vous pour la suite du processus.</p>
            <br/>
            <p>L'équipe JobMatch</p>
        `;

        const response = await transporter.sendMail({
            from: '"JobMatch" <amiraoumaymahayet@gmail.com>',
            to: email,
            subject: "Votre candidature a été acceptée",
            text: `Bonjour ${name},\n\nVotre candidature pour le poste ${offerTitle} a été acceptée.`,
            html: htmlContent,
        });

        console.log("📧 Email d'acceptation envoyé", response);
    } catch (error) {
        console.error("❌ Erreur envoi email acceptation :", error);
    }
};

// ❌ Email de refus
const sendRejectionEmail = async (email, name, offerTitle) => {
    try {
        const htmlContent = `
            <p>Bonjour ${name},</p>
            <p>Merci pour votre candidature à l'offre <strong>${offerTitle}</strong>.</p>
            <p>Après étude de votre dossier, nous sommes au regret de ne pas pouvoir y donner une suite favorable.</p>
            <p>Bonne continuation dans vos démarches professionnelles.</p>
            <br/>
            <p>L'équipe JobMatch</p>
        `;

        const response = await transporter.sendMail({
            from: '"JobMatch" <amiraoumaymahayet@gmail.com>',
            to: email,
            subject: "Réponse à votre candidature",
            text: `Bonjour ${name},\n\nVotre candidature pour l'offre ${offerTitle} n'a pas été retenue.`,
            html: htmlContent,
        });

        console.log("📧 Email de refus envoyé", response);
    } catch (error) {
        console.error("❌ Erreur envoi email refus :", error);
    }
};


module.exports = {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendConfirmationEmail,
     sendAcceptanceEmail,
    sendRejectionEmail
};