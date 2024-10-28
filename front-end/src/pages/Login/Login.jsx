import './login.css';
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const Login = () => {
    const [inputs, setInputs] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();
    const [setErrors] = useState(null);
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(inputs);
            navigate('/home');
            toast.success('Login successful');
        } catch (e) {
            if (e.response) {
                toast.error(e.response.data.message);
                setErrors(e.response.data);
            } else {
                console.error('Network error or other error occurred', e);
            }
        }
    };

    return (
        <div className='login'>
            <div className='form-login'>
                <h1>Login</h1>
                <form>
                    <input
                        type="email"
                        placeholder='Email'
                        required
                        name='email'
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        placeholder='Password'
                        required
                        name='password'
                        onChange={handleChange}
                    />
                    <button type='submit' onClick={handleSubmit}>Login</button>
                    <p>Don&#39;t have an account? <Link to='/register'>Register</Link></p>
                </form>
            </div>

            <div className='logo'>
                <img src='../../../public/vsb-logo.jpg' alt='vsb-logo' />
            </div>
        </div>
    );
};

export default Login;