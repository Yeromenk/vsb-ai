import Root from "./layout/root/Root.jsx";
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import Welcome from "./pages/Welcome/Welcome.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Home from "./layout/Home/Home.jsx";
import Summarize from "./pages/Summarize/Summarize.jsx";
import Dashboard from "./layout/Dashboard/Dashboard.jsx";
import Error from "./pages/Error/Error.jsx";
import {Toaster} from "react-hot-toast";
import Message from "./components/messages/Message";
import TranslateText from "./components/textInput/TranslateText";
import NewPrompt from "./pages/UserNewPrompt/NewPrompt";
import FormatingText from "./components/textInput/FormatingText";

const App = () => {
    return (
        <div>
            <RouterProvider router={router}/>
        </div>
    )
}

const Layout = () => {
    return (
        <>
            <Root/>
            <Toaster/>
            <Outlet/>
        </>
    )
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout/>,
        errorElement: <Error/>,

        children: [
            {
                path: '/',
                element: <Welcome/>
            },
            {
                path: '/login',
                element: <Login/>
            },
            {
                path: '/register',
                element: <Register/>
            },
            {
                element: <Dashboard/>,
                children: [
                    {
                        path: '/home',
                        element: <Home/>
                    },
                    {
                        path: '/summarize',
                        element: <Summarize/>
                    },
                    {
                        path: '/format',
                        element: <FormatingText/>
                    },
                    {
                        path: '/translate',
                        element: <TranslateText/>
                    },
                    {
                        path: '/chat/:id',
                        element: <Message/>
                    },
                    {
                      path: 'new-prompt',
                      element: <NewPrompt />
                    }
                ]
            }
        ]
    }])

export default App;