import './Root.css';
import { User, LogOut } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext.js";
import toast from "react-hot-toast";

const Root = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };

    const handleLogout = async () => {
        await logout();
        toast.success('Successfully logged out!');
        navigate('/');
    };

    return (
        <div className='root'>
            <div className='header'>
                {currentUser ? (
                    <>
                        <Link to='/home' className='link-home'><h1>VSB AI</h1></Link>
                        <div className='profile-dropdown'>
                            <button onClick={toggleDropdown}>
                                <User className='icon' />Profile
                            </button>
                            {isDropdownOpen && (
                                <div className='dropdown-menu'>
                                    <button onClick={handleLogout}><LogOut className='icon' /> Logout</button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <Link to='/login' className='link-home'><h1>VSB AI</h1></Link>
                )}
            </div>
        </div>
    );
};

export default Root;
