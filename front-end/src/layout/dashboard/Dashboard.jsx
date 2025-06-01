import { Outlet, useLocation } from 'react-router-dom';
import ChatList from '../chatList/ChatList.jsx';
import './Dashboard.css';

const Dashboard = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <div className="chat-layout">
      {!isAdminPage && <ChatList />}
      <div className="chat-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
