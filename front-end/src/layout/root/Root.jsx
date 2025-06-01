import './Root.css';
import { LogOut, User, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.js';
import toast from 'react-hot-toast';
import ProfileModal from '../../pages/ProfileModal/ProfileModal.jsx';

const Root = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
          <div className="user-actions">
            {currentUser?.isAdmin ? (
              <>
                <Link to="/admin" className="admin-button">
                  <Shield className="icon" />
                  Admin Panel
                </Link>
                <button onClick={() => setIsProfileModalOpen(true)} className="profile-button">
                  <User className="icon" />
                  Profile
                </button>
              </>
            ) : (
              <button onClick={() => setIsProfileModalOpen(true)} className="profile-button">
                <User className="icon" />
                Profile
              </button>
            )}

            <button onClick={handleLogout} className="logout-button">
              <LogOut className="icon" />
              Logout
            </button>

            {isProfileModalOpen && (
              <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={currentUser}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Root;
