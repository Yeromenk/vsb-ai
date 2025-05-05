import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Mail, CheckCircle, RefreshCw, Clock, ArrowRight } from 'lucide-react';
import './ConfirmEmail.css';

const ConfirmEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // In ConfirmEmail.jsx, update the token extraction logic in useEffect
  useEffect(() => {
    // First check if token is in URL params
    const params = new URLSearchParams(location.search);
    const queryToken = params.get('token');

    // Get token from a path if present
    const pathParts = location.pathname.split('/');
    const pathToken = pathParts[pathParts.length - 1];

    // Use either token source - if pathToken is long enough to be a token, use it
    // otherwise fall back to queryToken
    const token = pathToken && pathToken.length > 30 ? pathToken : queryToken;

    if (token && token.length > 30) {
      verifyEmail(token);
    } else {
      setVerificationStatus('no-token');
    }
  }, [location]);

  const verifyEmail = async token => {
    try {
      const response = await axios.get(`http://localhost:3000/auth/verify-email/${token}`);
      setVerificationStatus('success');
      toast.success('Email verified successfully!');

      // Auto-redirect to home after successful verification
      setTimeout(() => {
        navigate('/home');
      }, 3000);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      toast.error(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (cooldown > 0) {
      return;
    }

    setIsResending(true);
    try {
      await axios.post('http://localhost:3000/auth/resend-verification', { email });
      toast.success('Verification email sent successfully');
      setCooldown(60); // Start a 60-second cooldown
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="confirm-email-container">
      <div className="confirm-email-card-two-column">
        <div className="left-column">
          <h2>Email Verification</h2>

          {verificationStatus === 'pending' && (
            <div className="info-block">
              <p>We're verifying your email address...</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="info-block success">
              <p>Your email has been successfully verified!</p>
              <p>You will be redirected to the home page shortly.</p>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="info-block error">
              <h3>Verification Failed</h3>
              <p>The verification link may be invalid or expired.</p>
              <p>Please request a new verification email using the form.</p>
            </div>
          )}

          {verificationStatus === 'no-token' && (
            <div className="info-block">
              <h3>What to do:</h3>
              <ol>
                <li>Check your inbox for a verification email</li>
                <li>Click the verification link in the email</li>
                <li>
                  If you didn't receive an email, try these steps:
                  <ul>
                    <li>Check your spam folder</li>
                    <li>Verify your email address is correct</li>
                    <li>Request a new verification email</li>
                  </ul>
                </li>
              </ol>
            </div>
          )}
        </div>

        <div className="right-column">
          <div className="email-logo">
            <img src="/vsb-logo.jpg" alt="VSB AI Assistant" className="email-logo-image" />
          </div>

          {(verificationStatus === 'error' || verificationStatus === 'no-token') && (
            <div className="verification-form">
              <h3>Resend Verification Email</h3>
              <div className="email-input-container">
                <Mail size={18} className="email-icon" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <button
                className="confirm-email-button"
                onClick={handleResendVerification}
                disabled={isResending || cooldown > 0}
              >
                {cooldown > 0 ? (
                  <>
                    <Clock size={18} className="button-icon" />
                    Wait {cooldown}s
                  </>
                ) : isResending ? (
                  <>
                    <RefreshCw size={18} className="button-icon icon-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={18} className="button-icon" />
                    Send Verification
                  </>
                )}
              </button>
            </div>
          )}

          {verificationStatus === 'pending' && (
            <div className="verification-status">
              <RefreshCw size={40} className="icon-spin" />
              <p>Verifying your email address...</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="verification-status">
              <CheckCircle size={40} className="icon-success" />
              <p>Redirecting to home page...</p>
              <button className="confirm-email-button" onClick={() => navigate('/home')}>
                Continue to Home
                <ArrowRight size={18} className="button-icon-right" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmail;
