import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext(undefined);

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  useEffect(() => {
    // Check for GitHub / Google auth cookie when the component mounts
    const checkExternalAuth = () => {
      try {
        // Parse GitHub user data from cookie
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

    checkExternalAuth();
  }, []);

  const login = async inputs => {
    try {
      const res = await axios.post('http://localhost:3000/auth/login', inputs, {
        withCredentials: true, // !!!
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
        withCredentials: true // Add this to ensure cookie is properly cleared
      });
      setCurrentUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>{children}</AuthContext.Provider>
  );
};