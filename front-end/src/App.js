import Root from './layout/root/Root.jsx';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import Welcome from './pages/Welcome/Welcome.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import Home from './pages/Home/Home.jsx';
import Dashboard from './layout/dashboard/Dashboard.jsx';
import Error from './pages/Error/Error.jsx';
import { Toaster } from 'react-hot-toast';
import Message from './components/chat-message/Message';
import TranslateInput from './features/translate/TranslateInput';
import NewPrompt from './pages/NewPrompt/NewPrompt';
import FormatInput from './features/format/FormatInput';
import FileUploader from './features/summarize/FileUploader';
import CustomInput from './features/custom/CustomInput';
import Custom from './pages/Custom/Custom.jsx';

const App = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

const Layout = () => {
  return (
    <>
      <Root />
      <Toaster />
      <Outlet />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <Error />,

    children: [
      {
        path: '/',
        element: <Welcome />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        element: <Dashboard />,
        children: [
          {
            path: '/home',
            element: <Home />,
          },
          {
            path: '/summarize',
            element: <FileUploader />,
          },
          {
            path: '/format',
            element: <FormatInput />,
          },
          {
            path: '/translate',
            element: <TranslateInput />,
          },
          {
            path: '/translate/chat/:id',
            element: <Message type="translate" />,
          },
          {
            path: '/format/chat/:id',
            element: <Message type="format" />,
          },
          {
            path: '/file/chat/:id',
            element: <Message type="file" />,
          },
          {
            path: '/new-prompt',
            element: <NewPrompt />,
          },
          // Route for the template view
          {
            path: '/template/:id',
            element: <CustomInput />,
          },
          // Route for conversation based on template
          {
            path: '/custom/chat/:id',
            element: <Custom />,
          },
        ],
      },
    ],
  },
]);

export default App;
