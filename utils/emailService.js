const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2. Defina as opções do e-mail
    const mailOptions = {
        from: 'RastreiaProd <noreply@rastreiaprod.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: para enviar e-mails com HTML
    };

    // 3. Envie o e-mail
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        throw new Error('Houve um erro ao enviar o e-mail de redefinição de senha. Tente novamente mais tarde.');
    }
};

module.exports = sendEmail;