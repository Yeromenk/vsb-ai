import express from 'express';
import verifyToken, {
    githubCallback,
    googleCallback,
    login,
    logout,
    register,
    vsbCallback
} from '../controllers/auth.js';
import passport from 'passport';
import crypto from 'crypto';

import {PrismaClient} from '@prisma/client';
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/github', passport.authenticate('github', {scope: ['user:email']}));
router.get('/github/callback', passport.authenticate('github', {failureRedirect: '/login'}), githubCallback);

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));
router.get('/google/callback', passport.authenticate('google', {failureRedirect: '/login'}), googleCallback);

router.get('/validate-session', verifyToken, (req,
                                              res) => {
    try {
        res.status(200)
           .json({valid: true});
    } catch (error) {
        res.status(401)
           .json({message: 'Unauthorized'});
    }
});

// Verify email
router.get('/verify-email/:token', async (req,
                                          res) => {
    const {token} = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: {verificationToken: token}
        });

        if (!user) {
            return res.status(400)
                      .json({message: 'Invalid verification token'});
        }

        // Check if token is expired
        if (user.verificationTokenExpiry < new Date()) {
            return res.status(400)
                      .json({message: 'Verification token has expired'});
        }

        // Update user status
        await prisma.user.update({
            where: {id: user.id},
            data : {
                isEmailVerified        : true,
                verificationToken      : null,
                verificationTokenExpiry: null
            }
        });

        // Send confirmation email
        await transporter.sendMail({
            from   : process.env.EMAIL_USER,
            to     : user.email,
            subject: 'Your Email Has Been Verified',
            html   : `
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
            `
        });

        res.status(200)
           .json({message: 'Email verified successfully'});
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500)
           .json({message: 'Server error'});
    }
});

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth   : {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Resend verification email
router.post('/resend-verification', async (req,
                                           res) => {
    const {email} = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {email}
        });

        if (!user) {
            return res.status(404)
                      .json({message: 'User not found'});
        }

        if (user.isEmailVerified) {
            return res.status(400)
                      .json({message: 'Email already verified'});
        }

        // Generate new token
        const verificationToken = crypto.randomBytes(32)
                                        .toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.user.update({
            where: {id: user.id},
            data : {
                verificationToken,
                verificationTokenExpiry
            }
        });

        // Send verification email
        const verificationUrl = `http://localhost:3001/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
            from   : process.env.EMAIL_USER,
            to     : email,
            subject: 'Verify your email address',
            html   : `
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
      `
        });

        res.status(200)
           .json({message: 'Verification email sent'});
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500)
           .json({message: 'Server error'});
    }
});

// Check if the email is verified
router.get('/check-verification', verifyToken, async (req,
                                                      res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {id: req.user.id}
        });

        res.status(200)
           .json({isVerified: user.isEmailVerified});
    } catch (error) {
        console.error('Error checking verification:', error);
        res.status(500)
           .json({message: 'Server error'});
    }
});

// TODO: implement the VSB authentication
// VSB login redirect route
router.get('/vsb', (req,
                    res) => {
    // Redirect to VSB login page with return_url parameter
    const returnUrl = encodeURIComponent('http://localhost:3000/auth/vsb/callback');
    res.redirect(`https://cas.vsb.cz/cas/login?service=${returnUrl}`);
});

// VSB callback route
router.get('/vsb/callback', (req,
                             res,
                             next) => {
    // Handle the ticket parameter from CAS
    const ticket = req.query.ticket;
    if (!ticket) {
        return res.redirect('http://localhost:3001/login?error=vsb-auth-failed');
    }

    // Verify the ticket with VSB CAS server
    // This is where you validate the ticket and get user info
    passport.authenticate('cas', (err,
                                  user,
                                  info) => {
        if (err || !user) {
            return res.redirect('http://localhost:3001/login?error=vsb-auth-failed');
        }
        req.login(user, (err) => {
            if (err) return next(err);
            return vsbCallback(req, res);
        });
    })(req, res, next);
});

router.post('/vsb/login', (req,
                           res,
                           next) => {
    console.log("VSB login attempt received");

    if (!req.body.username || !req.body.password) {
        return res.status(400)
                  .json({message: 'Username and password required'});
    }

    // VSB usernames typically have a specific format like YER0013
    // Let's create the correct bindDN format directly
    const username = req.body.username.trim();

    // Remove @vsb.cz if present (handling both formats)
    const cleanUsername = username.replace(/@vsb\.cz$/, '');

    // Get the proper trailing context - for VSB it should be the OrgUnit
    // This depends on VSB's LDAP structure - using the last character may not be correct
    req.body.trailing_context = cleanUsername.slice(-1);

    console.log(`Auth attempt: username=${cleanUsername}, context=${req.body.trailing_context}`);

    // Use custom options to correctly format the bindDN
    const ldapOptions = {
        server: {
            url            : process.env.LDAP_URL || 'ldaps://ldap.vsb.cz',
            bindDN         : `cn=${cleanUsername},ou=${req.body.trailing_context},ou=USERS,o=VSB`,
            bindCredentials: req.body.password,
            searchBase     : 'ou=USERS,o=VSB',
            searchFilter   : `(cn=${cleanUsername})`,
            tlsOptions     : {
                rejectUnauthorized: false
            }
        }
    };

    passport.authenticate('ldapauth', ldapOptions, (err,
                                                    user,
                                                    info) => {
        if (err) {
            console.error("LDAP auth error:", err);
            return res.status(500)
                      .json({message: 'Authentication error: ' + err.message});
        }
        if (!user) {
            console.log("Authentication failed - invalid credentials");
            return res.status(401)
                      .json({message: 'Invalid VSB credentials'});
        }

        console.log("LDAP auth successful for:", cleanUsername);
        req.login(user, (err) => {
            if (err) {
                console.error("Login error:", err);
                return next(err);
            }
            console.log("User logged in, calling callback...");
            return vsbCallback(req, res);
        });
    })(req, res, next);
});

export default router;
