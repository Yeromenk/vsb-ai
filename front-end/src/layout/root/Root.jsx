import './Root.css';
import { LogOut, User, Shield, CircleChevronDown, X, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.js';
import toast from 'react-hot-toast';
import ProfileModal from '../../pages/profile-modal/ProfileModal.jsx';

const Root = ({ toggleSidebar }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Successfully logged out!');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleOpenProfile = () => {
    setIsProfileModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="root">
      <div className="header">
        {currentUser && (
          <button className="sidebar-menu-button" onClick={toggleSidebar}>
            <Menu className="icon" />
          </button>
        )}

        <Link to={currentUser ? '/home' : '/'} className="link-home">
          <h1>VSB AI</h1>
        </Link>

        {currentUser && (
          <>
            <div className="user-actions">
              {currentUser?.isAdmin && (
                <Link to="/admin" className="admin-button">
                  <Shield className="icon" />
                  Admin Panel
                </Link>
              )}
              <button onClick={() => setIsProfileModalOpen(true)} className="profile-button">
                <User className="icon" />
                Profile
              </button>
              <button onClick={handleLogout} className="logout-button">
                <LogOut className="icon" />
                Logout
              </button>
            </div>

            <button
              onClick={toggleMobileMenu}
              className={`mobile-menu-button ${isMobileMenuOpen ? 'active' : ''}`}
            >
              {isMobileMenuOpen ? <X className="icon" /> : <CircleChevronDown className="icon" />}
            </button>
          </>
        )}
      </div>

      {currentUser && isMobileMenuOpen && (
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          {currentUser?.isAdmin && (
            <Link to="/admin" className="mobile-action" onClick={() => setIsMobileMenuOpen(false)}>
              <Shield className="icon" />
              Admin Panel
            </Link>
          )}
          <button onClick={handleOpenProfile} className="mobile-action">
            <User className="icon" />
            Profile
          </button>
          <button onClick={handleLogout} className="mobile-action">
            <LogOut className="icon" />
            Logout
          </button>
        </div>
      )}

      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
        />
      )}
    </div>
  );
};

export default Root;
