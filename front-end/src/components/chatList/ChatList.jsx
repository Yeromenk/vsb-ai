import {Link, useNavigate} from "react-router-dom";
import './chatList.css';
import {Languages, FileText, Text, Menu, CirclePlus, Pencil, Trash2, X} from 'lucide-react';
import {useContext, useEffect, useState} from "react";
import axios from "axios";
import {AuthContext} from "../../context/AuthContext";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import {useLocation} from "react-router-dom";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import DeleteModal from "../../layout/Modal/DeleteModal";


const ChatList = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [editingChatId, setEditingChatId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    const startEditing = (chat) => {
        setEditingChatId(chat.id);
        setEditingTitle(chat.title);
    }

    const openDeleteModel = (chat) => {
        setSelectedChat(chat);
        setIsModalOpen(true);
    }

    const closeDeleteModel = () => {
        setIsModalOpen(false);
        setSelectedChat(null);
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const {currentUser} = useContext(AuthContext);

    const {
        isPending,
        data,
        error
    } = useQuery({
        queryKey: ['ChatList'],
        queryFn : () => axios.get('http://localhost:3000/ai/userChats', {
            withCredentials: true,
            params         : {
                userId: currentUser.id
            }
        })
                             .then(res => res.data),
    });

    const handleEdit = async (chatId,
                              newTitle) => {
        if (newTitle && newTitle.trim()) {
            try {
                await axios.put(`http://localhost:3000/ai/chat/${chatId}`, {
                    title: newTitle,
                }, {
                    withCredentials: true
                })
                toast.success("Chat title updated successfully");
                await queryClient.invalidateQueries(['ChatList']);
            } catch (e) {
                console.error("Error updating chat", e);
                toast.error("Error updating chat", e);
            }
        }
        setEditingChatId(null);
    }

    const handleDelete = async (chat) => {
        closeDeleteModel();

        if (location.pathname.includes(chat.id)) {
            navigate('/home');
        }

        try {
            await axios.delete(`http://localhost:3000/ai/chat/${chat.id}`, {
                withCredentials: true
            });
            toast.success("Chat deleted successfully");
            await queryClient.invalidateQueries(['ChatList']);
        } catch (e) {
            console.error("Error deleting chat", e);
            toast.error(`Error deleting chat: ${e.response?.data?.error || e.message}`);
        }
    };

    const isActive = (path) => location.pathname === path;
    const chats = data?.response || [];

    // Sort chats by newest first
    const sortedChats = chats.slice()
                             .sort((a,
                                    b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Group chats by month-year
    const groupedChats = {};
    sortedChats.forEach((chat) => {
        const dateObj = new Date(chat.createdAt);
        const monthYear = dateObj.toLocaleString('en-US', {
            month: 'long',
            year : 'numeric'
        });
        if (!groupedChats[monthYear]) {
            groupedChats[monthYear] = [];
        }
        groupedChats[monthYear].push(chat);
    });

    return (
        <>
            <DeleteModal
                isOpen={isModalOpen}
                onConfirm={() => handleDelete(selectedChat)}
                onClose={closeDeleteModel}
            />

            <button className='menu-button' onClick={toggleSidebar}>
                <Menu/>
            </button>

            <div className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

            <div className={`chatList ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <button className='menu-close-button' onClick={() => setIsSidebarOpen(false)}>
                    <X size={24} />
                </button>

                <Link
                    to='/translate'
                    className={`utility-link ${isActive('/translate') ? 'active' : ''}`}
                    onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
                >
                    <Languages/> Translate a text
                </Link>
                <Link
                    to='/format'
                    className={`utility-link ${isActive('/format') ? 'active' : ''}`}
                    onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
                >
                    <Text/> Create an alternative text
                </Link>
                <Link
                    to='/summarize'
                    className={`utility-link ${isActive('/summarize') ? 'active' : ''}`}
                    onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
                >
                    <FileText/> Summarize a file
                </Link>
                <Link
                    to='/new-prompt'
                    className={`utility-link ${isActive('/new-prompt') ? 'active' : ''}`}
                    onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
                >
                    <CirclePlus/> New Prompt
                </Link>

                <h1>Chat List</h1>
                <div className='list'>
                    {isPending
                        ? <Skeleton count={5} style={{
                            marginBottom: '20px',
                            padding: '10px'
                        }}/>
                        : error
                            ? "An error occurred"
                            : chats.length === 0
                                ? <p>No chats yet</p>
                                : Object.entries(groupedChats)
                                        .map(([monthYear, group]) => (
                                            <div key={monthYear}>
                                                <h2 className="monthYear">{monthYear}</h2>
                                                {group.map((chat) => {
                                                    let chatPath;
                                                    switch (chat.type) {
                                                        case 'translate':
                                                            chatPath = `/translate/chat/${chat.id}`;
                                                            break;
                                                        case 'file':
                                                            chatPath = `/file/chat/${chat.id}`;
                                                            break;
                                                        case 'format':
                                                            chatPath = `/format/chat/${chat.id}`;
                                                            break;
                                                        case 'user-prompt':
                                                            chatPath = `/user-prompt/chat/${chat.id}`;
                                                            break;
                                                        case 'custom':
                                                            chatPath = `/chat/${chat.id}`;
                                                            break;
                                                        default:
                                                            chatPath = `/chat/${chat.id}`;
                                                    }

                                                    return (
                                                        <div className="chatsLinks" key={chat.id}>
                                                            <Link
                                                                to={chatPath}
                                                                className={location.pathname === chatPath ?
                                                                    'active-chat' : ''}
                                                            >
                                                                <div className="chat-item">
                                                                    {editingChatId === chat.id ? (
                                                                        <form onSubmit={(e) => {
                                                                            e.preventDefault();
                                                                            handleEdit(chat.id, editingTitle);
                                                                        }}>
                                                                            <input
                                                                                type="text"
                                                                                value={editingTitle}
                                                                                onChange={(e) => setEditingTitle(
                                                                                    e.target.value)}
                                                                                onBlur={() => handleEdit(chat.id,
                                                                                    editingTitle)}
                                                                                autoFocus
                                                                            />
                                                                        </form>
                                                                    ) : (
                                                                        <>
                                                                            <span>{chat.title}</span>
                                                                            <div
                                                                                className="chat-icons"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <Pencil
                                                                                    className="icon-edit-icon"
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        startEditing(chat);
                                                                                    }}
                                                                                />
                                                                                <Trash2
                                                                                    className="icon-delete-icon"
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        openDeleteModel(chat);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </Link>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))
                    }
                </div>

                <div className='footer'>
                    <p>VSB AI can make mistakes. Recommended to check information</p>
                </div>
            </div>
        </>
    );
};

export default ChatList;