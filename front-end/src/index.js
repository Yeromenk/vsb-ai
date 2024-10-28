import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './src/App.js'
import './src/index.css'
import {AuthContextProvider} from "./src/context/AuthContext.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthContextProvider>
            <App/>
        </AuthContextProvider>
    </StrictMode>
)
