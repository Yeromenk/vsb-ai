import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Lock, LogIn, Eye, EyeOff, User } from 'lucide-react';
import axios from 'axios';
import './Vsb-login.css';
import { AuthContext } from '../../context/AuthContext';

const VsbLogin = () => {
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
  });
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
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    console.log('Starting VSB login via POST request');

    try {
      const response = await axios.post('http://localhost:3000/auth/vsb/login', inputs, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Login response received:', response.status);
      if (response.status === 200) {
        toast.success('VSB login successful');

        // Read the user_data cookie and set it in localStorage
        const userCookie = document.cookie.split('; ').find(row => row.startsWith('user_data='));
        if (userCookie) {
          const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          localStorage.setItem('user', JSON.stringify(userData));

          refreshUser();
        }

        setTimeout(() => {
          navigate('/home');
        }, 500);
      }
    } catch (error) {
      console.error('VSB login error:', error);
      toast.error(error.response?.data?.message || 'Authentication failed');
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
              required
            />
          </div>

          <div className="input-container">
            <Lock size={20} className="icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              name="password"
              value={inputs.password}
              onChange={handleChange}
              required
            />
            <div className="password-toggle" onClick={togglePasswordVisibility}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

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
