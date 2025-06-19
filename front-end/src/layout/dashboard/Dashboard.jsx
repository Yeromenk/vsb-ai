import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import ChatList from '../chatList/ChatList.jsx';
import './Dashboard.css';

const Dashboard = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';
  const { isSidebarOpen, setIsSidebarOpen } = useOutletContext() || {};

  return (
    <div className="chat-layout">
      {!isAdminPage && (
        <ChatList isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      )}
      <div className="chat-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
