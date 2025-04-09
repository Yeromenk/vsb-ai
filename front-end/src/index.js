import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import './index.css';
import { AuthContextProvider } from "./context/AuthContext.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <QueryClientProvider client={queryClient}>
                <AuthContextProvider>
                    <App />
                </AuthContextProvider>
            </QueryClientProvider>
        </GoogleOAuthProvider>
    </StrictMode>
);