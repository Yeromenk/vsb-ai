import {Link} from "react-router-dom";
import './chatList.css';
import {Languages, FileText, Text, Menu} from 'lucide-react';
import {useContext, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {AuthContext} from "../../context/AuthContext";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'


const ChatList = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }

    const {currentUser} = useContext(AuthContext);

    const {isPending, data, error} = useQuery({
        queryKey: ['ChatList'],
        queryFn: () => axios.get('http://localhost:3000/ai/userChats', {
            withCredentials: true,
            params: {
                userId: currentUser.id
            }
        }).then(res => res.data),
    })

    const chats = data?.response || [];

    return (
        <div className={`chatList ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <button className='menu-button' onClick={toggleSidebar}>
                <Menu/>
            </button>
            <Link to='/translate'><Languages/> Translate a text</Link>
            <Link to='/format'><Text/> Create an alternative text</Link>
            <Link to='/summarize'><FileText/> Summarize a file</Link>

            <h1>Chat List</h1>
            <div className='list'>
                {isPending
                    ? <Skeleton count={5} style={{marginBottom: '20px', padding: '10px'}}/>
                    : error
                        ? "An error occurred"
                        : chats.length === 0 ?
                            <p>No chats yet</p>
                            : chats?.map((chat) => (
                                <Link to={`/chat/${chat.id}`}
                                      key={chat.id}>
                                    {chat.title}
                                </Link>
                            ))}
            </div>

            <div className='footer'>
                <p>VSB AI can make mistakes. Recommended to check information</p>
            </div>
        </div>
    );
};

export default ChatList;