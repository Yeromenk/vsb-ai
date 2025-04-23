import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext(undefined);

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to validate the stored user session
    const validateSession = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (storedUser) {
        try {
          // Make a request to validate a session
          await axios.get('http://localhost:3000/auth/validate-session', {
            withCredentials: true
          });
          // If successful, session is valid
          setCurrentUser(storedUser);
        } catch (error) {
          // If a session is invalid, clear local storage
          console.log('Session expired:', error);
          localStorage.removeItem('user');
          setCurrentUser(null);
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
        const userCookie = document.cookie
                                   .split('; ')
                                   .find(row => row.startsWith('user_data='));

        if (userCookie) {
          const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          setCurrentUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));

          // Clear the cookie after reading it
          document.cookie = 'user_data=; max-age=0; path=/;';
        }
      } catch (error) {
        console.error('Error parsing GitHub auth cookie:', error);
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
      await axios.post('http://localhost:3000/auth/logout', {}, {
        withCredentials: true
      });
      setCurrentUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>{children}</AuthContext.Provider>
  );
};