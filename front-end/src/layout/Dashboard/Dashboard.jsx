import {Outlet} from "react-router-dom";
import ChatList from "../../components/chatList/ChatList.jsx";
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className='chat-layout'>
            <ChatList />
            <div className='chat-content'>
                <Outlet/>
            </div>
        </div>
    );
};

export default Dashboard;