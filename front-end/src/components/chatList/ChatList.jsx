import { Link } from "react-router-dom";
import './chatList.css';
import { Languages, FileText, Text, Menu } from 'lucide-react';
import { useState } from "react";

const ChatList = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }

    return (
        <div className={`chatList ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <button className='menu-button' onClick={toggleSidebar}>
                <Menu />
            </button>
            <Link to='/translate'><Languages /> Translate a text</Link>
            <Link to='/format'><Text /> Create an alternative text</Link>
            <Link to='/summarize'><FileText /> Summarize a file</Link>

            <h1>Chat List</h1>
            <div className='list'>
                <Link to='/'>Title of chat</Link>
                <Link to='/'>Title of chat</Link>
                <Link to='/'>Title of chat</Link>
                <Link to='/'>Title of chat</Link>
                <Link to='/'>Title of chat</Link>
                <Link to='/'>Title of chat</Link>
                <Link to='/'>Title of chat</Link>
            </div>

            <div className='footer'>
                <p>VSB AI can make mistakes. Recommended to check information</p>
            </div>
        </div>
    );
};

export default ChatList;