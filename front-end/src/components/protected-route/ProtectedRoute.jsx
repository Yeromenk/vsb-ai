import React, { useContext, useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import LoadingState from '../loading-state/LoadingState';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children, requireApiKey = false, isAdmin = false }) => {
  const { currentUser, hasApiKey, checkingApiKey } = useContext(AuthContext);
  const [isVerified, setIsVerified] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();
  const toastShown = useRef(false);

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
        console.error('error checking verification status:', error);
        setIsVerified(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkVerification();
  }, [currentUser]);

  // Show API key toast message only once when the condition is met
  useEffect(() => {
    if (requireApiKey && hasApiKey === false && !checkingApiKey && !toastShown.current) {
      toast.error(
        'OpenAI API key is required to use AI features. Please set it up in your profile.'
      );
      toastShown.current = true;
    }
  }, [requireApiKey, hasApiKey, checkingApiKey]);

  if (isChecking || checkingApiKey) {
    return <LoadingState message="Checking authentication..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // If admin route but user isn't admin
  if (isAdmin && !currentUser.isAdmin) {
    return <Navigate to="/home" />;
  }

  // Check if route requires an API key and the user doesn't have one
  if (requireApiKey && !hasApiKey) {
    console.log('User does not have an API key');
    return <Navigate to="/home" state={{ apiKeyRequired: true }} replace />;
  }

  return children;
};

export default ProtectedRoute;
