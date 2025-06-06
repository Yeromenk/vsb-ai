import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext(undefined);

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(null);
  const [checkingApiKey, setCheckingApiKey] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // refresh function to allow manual context updates
  const refreshUser = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setCurrentUser(storedUser);

      await checkApiKeyStatus();
    }
  };

  const checkApiKeyStatus = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) return;

    setCheckingApiKey(true);
    try {
      const response = await axios.get('http://localhost:3000/ai/check-api-key', {
        withCredentials: true,
      });
      setHasApiKey(response.data.hasApiKey);
    } catch (error) {
      console.error('error checking API key:', error);
      setHasApiKey(false);
    } finally {
      setCheckingApiKey(false);
    }
  };

  useEffect(() => {
    // Function to validate the stored user session
    const validateSession = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (storedUser) {
        try {
          // Make a request to validate a session
          const response = await axios.get('http://localhost:3000/auth/validate-session', {
            withCredentials: true,
          });
          // If successful, session is valid
          setCurrentUser(storedUser);
          setIsAdmin(response.data.isAdmin || false);
          await checkApiKeyStatus();
        } catch (error) {
          // If a session is invalid, clear local storage
          console.log('Session expired:', error);
          localStorage.removeItem('user');
          setCurrentUser(null);
          setIsAdmin(false);
        }
      }

      setLoading(false);
    };

    validateSession();
    checkExternalAuth();
  }, []);

  // Check for GitHub / Google auth cookie when the component mounts
  const checkExternalAuth = () => {
    try {
      // Parse GitHub / Google user data from cookie
      const userCookie = document.cookie.split('; ').find(row => row.startsWith('user_data='));

      if (userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        setCurrentUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        // Clear the cookie after reading it
        document.cookie = 'user_data=; max-age=0; path=/;';
      }
    } catch (error) {
      console.error('error parsing GitHub auth cookie:', error);
    }
  };

  const login = async inputs => {
    try {
      const res = await axios.post('http://localhost:3000/auth/login', inputs, {
        withCredentials: true,
      });
      setCurrentUser(res.data);
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        'http://localhost:3000/auth/logout',
        {},
        {
          withCredentials: true,
        }
      );
      setCurrentUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
      checkApiKeyStatus();
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        hasApiKey,
        checkingApiKey,
        refreshUser,
        loading,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
