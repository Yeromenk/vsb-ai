import { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import LoadingState from '../LoadingState/LoadingState';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    if (!loading) {
      if (!currentUser && !location.pathname.includes('/welcome') &&
        !location.pathname.includes('/login') &&
        !location.pathname.includes('/register')) {
        navigate('/');
      }
    }
  }, [currentUser, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <LoadingState message="Checking authentication..." />
      </div>
    );
  }

  // For public routes or authenticated users
  return children;
};

export default ProtectedRoute;