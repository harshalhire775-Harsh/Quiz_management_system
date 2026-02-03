const nodemailer = require('nodemailer');

// Create reusable transporter using SMTP settings from .env
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('Server is not ready to take our messages');
        console.log(error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

// Generic sendMail helper
const sendMail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: `"QuizPro" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error.message);
        return false;
    }
};

module.exports = { sendMail };
