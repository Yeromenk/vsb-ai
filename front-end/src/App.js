import Root from "./layout/root/Root.jsx";
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import Welcome from "./pages/Welcome/Welcome.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Home from "./layout/Home/Home.jsx";
import Summarize from "./pages/Summarize/Summarize.jsx";
import Format from "./pages/Formate/Format.jsx";
import Dashboard from "./layout/Dashboard/Dashboard.jsx";
import Translate from "./pages/Translate/Translate.jsx";
import Error from "./pages/Error/Error.jsx";
import {Toaster} from "react-hot-toast";


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
                        element: <Format/>
                    },
                    {
                        path: '/translate',
                        element: <Translate/>
                    }
                ]
            }
        ]
    }])

export default App;