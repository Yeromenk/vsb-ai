import express from 'express';
import nodemailer from 'nodemailer';
import verifyToken from '../controllers/auth.js';

const router = express.Router();

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// TODO: add function to send email to user
router.post('/send-email', verifyToken, async (req, res) => {
    const { to, subject, content } = req.body;
    const userId = req.user.id;

    if (!to || !content) {
        return res.status(400).json({ message: 'Recipient and content are required' });
    }

    try {
        // Create email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject || 'AI Assistant Response',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3a5bc7;">Message from AI Assistant</h2>
          <div style="padding: 15px; background-color: #f7f9fc; border-radius: 8px;">
            ${content.replace(/\n/g, '<br/>')}
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This email was sent from the VSB AI Assistant application.
          </p>
        </div>
      `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Log this action
        console.log(`Email sent by user ${userId} to ${to}`);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
});

export default router;