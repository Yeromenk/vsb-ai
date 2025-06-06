import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './ForgotPassword.css';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is not valid');
      return false;
    }
    return true;
  };

  const handleChange = e => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:3000/account/forgot-password', { email });
      toast.success('Password reset code sent to your email');
      navigate('/verify-reset-code', { state: { email } });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset code';
      toast.error(message);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h1>Reset Password</h1>
        <p className="description-forgot">
          Enter your email address and we'll send you a code to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-container-forgot">
            <Mail size={20} className="icon" />
            <input type="email" placeholder="Email" value={email} onChange={handleChange} />
          </div>
          {error && <div className="error-message-forgot">{error}</div>}

          <button type="submit" className="primary-button-forgot" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw size={40} className="icon-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Code
              </>
            )}
          </button>

          <div className="back-to-login">
            <Link to="/login" className="back-link">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
