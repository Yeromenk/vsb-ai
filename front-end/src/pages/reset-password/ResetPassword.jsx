import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, RefreshCw, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import AnimatedBackground from '../../components/animated-background/AnimatedBackground';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = location.state?.resetToken;

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  const validatePassword = () => {
    if (!password) {
      setError('Password is required');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validatePassword()) return;

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:3000/account/reset-password', {
        resetToken,
        newPassword: password,
      });

      toast.success('Password reset successful');
      navigate('/login', { state: { passwordReset: true } });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password';
      toast.error(message);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <AnimatedBackground />
      <div className="forgot-password-container">
        <h1>Create New Password</h1>
        <p className="description-forgot">Enter your new password below.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-container-forgot">
            <Lock size={20} className="icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="input-container-forgot">
            <Lock size={20} className="icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
            />
          </div>

          {error && <div className="error-message-forgot">{error}</div>}

          <button type="submit" className="primary-button-forgot" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw size={40} className="icon-spin" />
                Resetting...
              </>
            ) : (
              <>
                <Send size={18} />
                Reset Password
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

export default ResetPassword;
