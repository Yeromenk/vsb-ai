import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext.jsx";

const Register = () => {
    const [inputs, setInputs] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [setErrors] = useState(null);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/auth/register', inputs);
            localStorage.setItem('token', response.data.token);
            await login(inputs);
            navigate('/home');
            toast.success(response.data.message);
        } catch (e) {
            if (e.response) {
                toast.error(e.response.data.message);
                setErrors(e.response.data);
            } else {
                toast.error(e.message);
                console.error('Network error or other error occurred', e);
            }
        }
    };

    return (
        <div className='login'>
            <div className='form-login'>
                <h1>Register</h1>
                <form>
                    <input
                        type="email"
                        placeholder='Email'
                        name='email'
                        required onChange={handleChange}
                    />
                    <input
                        type="text"
                        placeholder='Username'
                        name='username'
                        required onChange={handleChange}
                    />
                    <input
                        type="password"
                        placeholder='Password'
                        name='password'
                        required onChange={handleChange}
                    />
                    <button
                        type='submit'
                        onClick={handleSubmit}>Register</button>
                    <p>Already have an account? <a href='/login'>Login</a></p>
                </form>
            </div>

            <div className='logo'>
                <img src='../../../public/vsb-logo.jpg' alt='vsb-logo' />
            </div>
        </div>
    );
};

export default Register;