import './login.css';
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext.js";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";

const Login = () => {
    const [inputs, setInputs] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const validateInputs = () => {
        const newErrors = { email: '', password: '' };
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateInputs()) {
            return;
        }

        try {
            await login(inputs);
            toast.success('Login successful');
            navigate('/home');
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
        <div className='login'>
            <div className='form-login'>
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <Mail size={20} className="icon" />
                        <input
                            type="email"
                            placeholder='Email'
                            name='email'
                            value={inputs.email}
                            onChange={handleChange}
                        />
                    </div>
                    {errors.email && <div className="error-message">{errors.email}</div>}

                    <div className="input-container">
                        <Lock size={20} className="icon" />
                        <input
                            type="password"
                            placeholder='Password'
                            name='password'
                            value={inputs.password}
                            onChange={handleChange}
                        />
                    </div>
                    {errors.password && <div className="error-message">{errors.password}</div>}

                    <button type='submit'>
                        <LogIn size={18} />
                        Login
                    </button>
                    <p>Don't have an account? <Link to='/register'>Register</Link></p>
                </form>
            </div>

            <div className='logo'>
                <img src='/vsb-logo.jpg' alt='vsb-logo'/>
            </div>
        </div>
    );
};

export default Login;