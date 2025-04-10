import { useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext.js';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../Login/Login.css';

const Register = () => {
  const [inputs, setInputs] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const validateInputs = () => {
    const newErrors = { username: '', email: '', password: '' };
    let isValid = true;

    if (!inputs.username) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (inputs.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

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
    } else if (inputs.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/auth/register', inputs);
      localStorage.setItem('token', response.data.token);
      await login(inputs);
      navigate('/home');
      toast.success(response.data.message || 'Registration successful!');
    } catch (e) {
      if (e.response) {
        toast.error(e.response.data.message);
      } else {
        toast.error('Network error occurred. Please try again.');
        console.error('Network error or other error occurred', e);
      }
    }
  };

  return (
    <div className="login">
      <div className="form-login">
        <h1>Register</h1>
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
          {errors.email && <div className="error-message">{errors.email}</div>}

          <div className="input-container">
            <User size={20} className="icon" />
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={inputs.username}
              onChange={handleChange}
            />
          </div>
          {errors.username && <div className="error-message">{errors.username}</div>}

          <div className="input-container">
            <Lock size={20} className="icon" />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={inputs.password}
              onChange={handleChange}
            />
          </div>
          {errors.password && <div className="error-message">{errors.password}</div>}

          <button type="submit">
            <UserPlus size={18} />
            Register
          </button>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>

      <div className="logo">
        <img src="/vsb-logo.jpg" alt="vsb-logo" />
      </div>
    </div>
  );
};

export default Register;
