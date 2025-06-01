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
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import VsbLoginForm from './pages/VSB-Login/Vsb-login';
import ConfirmEmail from './pages/Confirm-email/ConfirmEmail';
import ForgotPassword from './pages/Forgot-password/ForgotPassword';
import VerifyResetCode from './pages/VerifyResetCode/VerifyResetCode';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import SharedChatPage from './pages/SharedChatPage/SharedChatPage';
import Admin from './pages/Admin/Admin';

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

const Layout = () => {
  return (
    <>
      <Root />
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
