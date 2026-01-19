import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.js';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, RefreshCw } from 'lucide-react';
import './Login.css';
import AnimatedBackground from '../../components/animated-background/AnimatedBackground';

const Login = () => {
  const [inputs, setInputs] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:3000/auth/github';
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const validateInputs = () => {
    const newErrors = {
      email: '',
      password: '',
    };
    let isValid = true;

    if (!inputs.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(inputs.email)) {
      newErrors.email = 'Email is not valid';
      isValid = false;
    }

    if (!inputs.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(inputs);
      toast.success('login successful');
      navigate('/home');
    } catch (e) {
      if (e.response) {
        toast.error(e.response.data.message);
      } else {
        toast.error('Network error occurred. Please try again.');
        console.error('Network error or other error occurred', e);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login">
      <AnimatedBackground />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-left">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
              <div className="input-container">
                <Mail size={20} className="icon" />
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={inputs.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <div className="error-message-login">{errors.email}</div>}

              <div className="input-container">
                <Lock size={20} className="icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  name="password"
                  value={inputs.password}
                  onChange={handleChange}
                />
                <div className="password-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
              {errors.password && <div className="error-message-login">{errors.password}</div>}

              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw size={18} className="icon-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Login</span>
                  </>
                )}
              </button>

              <div className="forgot-password">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <div className="social-login">
                <p>OR</p>
                <div className="oauth-buttons">
                  <button type="button" className="link-button" onClick={handleGitHubLogin}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                    <span>GitHub</span>
                  </button>

                  <button type="button" className="link-button" onClick={handleGoogleLogin}>
                    <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    className="link-button"
                    onClick={() => navigate('/vsb-login')}
                  >
                    <img
                      src="/vsb-logo.jpg"
                      alt="VSB"
                      width="20"
                      height="20"
                      style={{ borderRadius: '4px' }}
                    />
                    <span>VSB Login</span>
                  </button>
                </div>
              </div>

              <p>
                Don't have an account? <Link to="/register">Register</Link>
              </p>
            </form>
          </div>

          <div className="auth-right">
            <img src="/vsb-logo.jpg" alt="vsb-logo" className="logo-image" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
