import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Lock, LogIn, Eye, EyeOff, User, AlertCircle } from 'lucide-react';
import axios from 'axios';
import './Vsb-login.css';
import { AuthContext } from '../../context/AuthContext';

const VsbLogin = () => {
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateInputs = () => {
    const newErrors = {};

    // Check username format
    if (inputs.username.includes('@vsb.cz')) {
      newErrors.username = 'Please enter only your VSB username without @vsb.cz';
    } else if (inputs.username.includes('@')) {
      newErrors.username = 'Please enter your VSB username, not an email address';
    }

    // Check password
    if (inputs.password.length < 1) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (loading) return;

    // Validate inputs before submission
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/auth/vsb/login', inputs, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        toast.success('VSB login successful');

        // Read the user_data cookie and set it in localStorage
        const userCookie = document.cookie.split('; ').find(row => row.startsWith('user_data='));
        if (userCookie) {
          const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          localStorage.setItem('user', JSON.stringify(userData));
        }

        setTimeout(() => {
          refreshUser();
          navigate('/home');
        }, 1000);
      }
    } catch (error) {
      console.error('VSB login error:', error);
      if (error.response?.status === 401) {
        toast.error('Invalid VSB credentials. Please check your username and password.');
      } else if (error.response?.status === 500 && error.response?.data?.message) {
        toast.error(error.response.data.message);
        console.log(error.response.data.message);
      } else {
        toast.error('Authentication failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="form-login">
        <h1>VSB University Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <User size={20} className="icon" />
            <input
              type="text"
              placeholder="VSB Username"
              name="username"
              value={inputs.username}
              onChange={handleChange}
              className={errors.username ? 'input-error' : ''}
              required
            />
          </div>
          {errors.username && (
            <div className="error-message-login">
              <AlertCircle size={16} />
              {errors.username}
            </div>
          )}

          <div className="input-container">
            <Lock size={20} className="icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              name="password"
              value={inputs.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              required
            />
            <div className="password-toggle" onClick={togglePasswordVisibility}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>
          {errors.password && (
            <div className="error-message-login">
              <AlertCircle size={16} />
              {errors.password}
            </div>
          )}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                <LogIn size={18} />
                Login with VSB Credentials
              </>
            )}
          </button>

          <div className="login-links">
            <Link to="/login">Use regular login</Link>
            <Link to="/register">Create an account</Link>
          </div>
        </form>
      </div>

      <div className="vsb-logo">
        <img src="/vsb-img.png" alt="VSB University" />
      </div>
    </div>
  );
};

export default VsbLogin;
