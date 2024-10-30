import axios from 'axios';
import {createContext, useEffect, useState} from 'react';

export const AuthContext = createContext(undefined);

export const AuthContextProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem('user')) || null
    );

    const login = async (inputs) => {
        try {
            const res = await axios.post(
                'http://localhost:3000/auth/login',
                inputs,
                {
                    withCredentials: true, // !!!
                }
            );
            setCurrentUser(res.data);
        } catch (e) {
            console.log(e);
            throw e;
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:3000/auth/logout');
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
        <AuthContext.Provider value={{currentUser, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};