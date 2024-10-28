import './Root.css';
import {User, LogOut} from 'lucide-react';
import {Link} from "react-router-dom";
import {useContext, useState} from "react";
import {AuthContext} from "../../context/AuthContext.jsx";


const Root = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };

    const {currentUser, logout} = useContext(AuthContext);

    return (
        <div className='root'>
            <div className='header'>
                {currentUser ? (
                    <>
                        <Link to='/home' className='link-home'><h1>VSB AI</h1></Link>
                        <div className='profile-dropdown'>
                            <button onClick={toggleDropdown}>
                                <User className='icon'/>Profile
                            </button>
                            {isDropdownOpen && (
                                <div className='dropdown-menu'>
                                    <button onClick={logout}><LogOut className='icon'/> Logout</button>
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
