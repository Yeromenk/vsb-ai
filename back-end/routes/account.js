import express from 'express';
import { PrismaClient } from '@prisma/client';
import verifyToken from '../controllers/auth.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { transporter } from '../config/email.js';

const prisma = new PrismaClient();
const router = express.Router();

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Check if the token is expired
    if (user.verificationTokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Verification token has expired' });
    }

    // Update user status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    // Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Email Has Been Verified',
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3a5bc7;">Email Verification Successful!</h2>
                <div style="padding: 20px; background-color: #f0fff4; border-radius: 8px; border-left: 4px solid #38a169;">
                    <p>Dear ${user.username},</p>
                    <p>Your email address has been successfully verified. Thank you for completing this step!</p>
                    <p>You can now fully access all features of the VSB AI Assistant.</p>
                </div>
                <p style="margin-top: 20px;">
                    <a href="http://localhost:3001/home" style="display: inline-block; padding: 10px 20px; background-color: #4b70e2; color: white; text-decoration: none; border-radius: 4px;">Go to Dashboard</a>
                </p>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    This is an automated message from the VSB AI Assistant. Please do not reply to this email.
                </p>
            </div>
            `,
    });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Send verification email
    const verificationUrl = `http://localhost:3001/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3a5bc7;">VSB AI Assistant Email Verification</h2>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4b70e2; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    This is an automated message from the VSB AI Assistant. Please do not reply to this email.
                </p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if the email is verified
router.get('/check-verification', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    res.status(200).json({ isVerified: user.isEmailVerified });
  } catch (error) {
    console.error('Error checking verification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// request password reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode,
        resetCodeExpiry,
      },
    });

    // Send email with reset code
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3a5bc7;">Password Reset Request</h2>
          <p>Your password reset code is:</p>
          <div style="padding: 15px; background-color: #f5f5f5; border-radius: 5px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
            ${resetCode}
          </div>
          <p>This code will expire in 30 minutes.</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            If you did not request this reset, please ignore this email.
          </p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Reset code sent to your email' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify reset code
router.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.resetCode || user.resetCode !== code) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    if (user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ message: 'Reset code has expired' });
    }

    // Generate a temporary token for password reset
    const resetToken = crypto.randomBytes(20).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    res.status(200).json({ resetToken });
  } catch (error) {
    console.error('Code verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      });
    }

    // Update password and clear reset fields
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
