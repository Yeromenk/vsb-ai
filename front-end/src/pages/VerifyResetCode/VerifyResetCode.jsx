import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const VerifyResetCode = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [resendTimeLeft, setResendTimeLeft] = useState(60); // 1 minute countdown for resend
  const [isResending, setIsResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    // Timer for code expiration
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Timer for resend button
    const resendTimer = setInterval(() => {
      setResendTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(resendTimer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(resendTimer);
    };
  }, [email, navigate]);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await axios.post('http://localhost:3000/account/forgot-password', { email });
      toast.success('New verification code sent');
      setResendTimeLeft(60); // Reset the resend timer to 1 minute
      setTimeLeft(30 * 60); // Reset the main timer to 30 minutes
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to resend code';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:3000/account/verify-reset-code', {
        email,
        code,
      });

      const { resetToken } = response.data;
      toast.success('Code verified successfully');
      navigate('/reset-password', { state: { resetToken } });
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid code';
      toast.error(message);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h1>Verify Code</h1>
        <p className="description-forgot">
          Enter the 6-digit code sent to your email address.
          <br />
          Time remaining: <span className="timer">{formatTime(timeLeft)}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-container-forgot">
            <KeyRound size={20} className="icon" />
            <input
              type="text"
              placeholder="6-digit code"
              value={code}
              onChange={e => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                if (error) setError('');
              }}
              maxLength={6}
            />
          </div>
          {error && <div className="error-message-forgot">{error}</div>}

          <button
            type="submit"
            className="primary-button-forgot"
            disabled={isSubmitting || timeLeft === 0}
          >
            {isSubmitting ? 'Verifying...' : 'Verify Code'}
          </button>

          <div className="resend-container">
            <p className="spam-notice">
              Didn't receive a code? Please check your spam or junk folder.
            </p>
            {resendTimeLeft > 0 ? (
              <p className="resend-timer">
                Resend available in: <span className="timer">{formatTime(resendTimeLeft)}</span>
              </p>
            ) : (
              <button
                type="button"
                className="resend-button"
                onClick={handleResendCode}
                disabled={isResending}
              >
                <RefreshCw size={16} className={isResending ? 'spinning' : ''} />
                {isResending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>

          <div className="back-to-login">
            <Link to="/forgot-password" className="back-link">
              <ArrowLeft size={16} />
              Back to Request Form
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyResetCode;
