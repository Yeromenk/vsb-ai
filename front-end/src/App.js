import Root from './layout/root/Root.jsx';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import Welcome from './pages/welcome/Welcome.jsx';
import Login from './pages/login/Login.jsx';
import Register from './pages/register/Register.jsx';
import Home from './pages/home/Home.jsx';
import Dashboard from './layout/dashboard/Dashboard.jsx';
import Error from './pages/error/Error.jsx';
import { Toaster } from 'react-hot-toast';
import Message from './components/message/Message';
import TranslateInput from './features/translate/TranslateInput';
import NewPrompt from './pages/new-prompt/NewPrompt';
import FormatInput from './features/format/FormatInput';
import FileUploader from './features/summarize/FileUploader';
import CustomInput from './features/custom/CustomInput';
import Custom from './pages/custom/Custom.jsx';
import ProtectedRoute from './components/protected-route/ProtectedRoute';
import VsbLoginForm from './pages/vsb-login/Vsb-login';
import ConfirmEmail from './pages/confirm-email/ConfirmEmail';
import ForgotPassword from './pages/forgot-password/ForgotPassword';
import VerifyResetCode from './pages/verify-reset-code/VerifyResetCode';
import ResetPassword from './pages/reset-password/ResetPassword';
import SharedChatPage from './pages/shared-chat-page/SharedChatPage';
import Admin from './pages/admin/Admin';
import EmailInput from './features/email/EmailInput';
import { useState } from 'react';

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Root toggleSidebar={toggleSidebar} />
      <Outlet context={{ isSidebarOpen, setIsSidebarOpen }} />
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
        path: '/vsb-login',
        element: <VsbLoginForm />,
      },
      {
        path: '/verify-email',
        element: <ConfirmEmail />,
      },
      {
        path: '/verify-email/:token',
        element: <ConfirmEmail />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'verify-reset-code',
        element: <VerifyResetCode />,
      },
      {
        path: '/reset-password',
        element: <ResetPassword />,
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute isAdmin={true}>
            <Dashboard />
          </ProtectedRoute>
        ),
        children: [
          {
            path: '',
            element: <Admin />,
          },
        ],
      },
      {
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
        children: [
          {
            path: '/home',
            element: <Home />,
          },
          {
            path: '/summarize',
            element: (
              <ProtectedRoute requireApiKey={true}>
                <FileUploader />
              </ProtectedRoute>
            ),
          },
          {
            path: '/format',
            element: (
              <ProtectedRoute requireApiKey={true}>
                <FormatInput />
              </ProtectedRoute>
            ),
          },
          {
            path: '/translate',
            element: (
              <ProtectedRoute requireApiKey={true}>
                <TranslateInput />
              </ProtectedRoute>
            ),
          },
          {
            path: '/email',
            element: (
              <ProtectedRoute requireApiKey={true}>
                <EmailInput />
              </ProtectedRoute>
            ),
          },
          {
            path: '/translate/chat/:id',
            element: (
              <ProtectedRoute requireApiKey={true}>
                <Message type="translate" />
              </ProtectedRoute>
            ),
          },
          {
            path: '/format/chat/:id',
            element: (
              <ProtectedRoute requireApiKey={true}>
                <Message type="format" />
              </ProtectedRoute>
            ),
          },
          {
            path: '/file/chat/:id',
            element: (
              <ProtectedRoute requireApiKey={true}>
                <Message type="file" />
              </ProtectedRoute>
            ),
          },
          {
            path: '/email/chat/:id',
            element: (
              <ProtectedRoute requireApiKey={true}>
                <Message type="email" />
              </ProtectedRoute>
            ),
          },
          {
            path: '/new-prompt',
            element: (
              <ProtectedRoute requireApiKey={true}>
                <NewPrompt />
              </ProtectedRoute>
            ),
          },
          // Route for the template view
          {
            path: '/template/:id',
            element: (
              <ProtectedRoute requireApiKey={true}>
                <CustomInput />
              </ProtectedRoute>
            ),
          },
          // Route for conversation based on template
          {
            path: '/custom/chat/:id',
            element: (
              <ProtectedRoute requireApiKey={true}>
                <Custom />
              </ProtectedRoute>
            ),
          },
          {
            path: '/shared-chat/:shareCode',
            element: (
              <ProtectedRoute requireApiKey={true}>
                <SharedChatPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
]);

export default App;
