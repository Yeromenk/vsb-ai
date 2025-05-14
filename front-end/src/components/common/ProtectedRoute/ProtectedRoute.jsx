import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import LoadingState from '../LoadingState/LoadingState';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [isVerified, setIsVerified] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      setIsChecking(false);
      return;
    }

    const checkVerification = async () => {
      try {
        const response = await axios.get('http://localhost:3000/account/check-verification', {
          withCredentials: true,
        });
        setIsVerified(response.data.isVerified);
      } catch (error) {
        console.error('Error checking verification status:', error);
        setIsVerified(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkVerification();
  }, [currentUser]);

  if (isChecking) {
    return <LoadingState message="Checking authentication..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default ProtectedRoute;
