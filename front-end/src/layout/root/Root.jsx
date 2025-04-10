import './Root.css';
import { LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.js';
import toast from 'react-hot-toast';

const Root = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Successfully logged out!');
    navigate('/');
  };

  return (
    <div className="root">
      <div className="header">
        <Link to={currentUser ? '/home' : '/'} className="link-home">
          <h1>VSB AI</h1>
        </Link>

        {currentUser && (
          <button onClick={handleLogout} className="logout-button">
            <LogOut className="icon" />
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Root;
