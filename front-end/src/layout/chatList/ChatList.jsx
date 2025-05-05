import { Link, useNavigate, useLocation } from 'react-router-dom';
import './ChatList.css';
import {
  Languages,
  FileText,
  Text,
  Menu,
  CirclePlus,
  Pencil,
  Trash2,
  X,
  User,
  Search,
} from 'lucide-react';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import DeleteModal from '../../components/common/Modal/DeleteModal';
import LoadingState from '../../components/common/LoadingState/LoadingState';

const ChatList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const startEditing = chat => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const openDeleteModel = chat => {
    setSelectedChat(chat);
    setIsModalOpen(true);
  };

  const closeDeleteModel = () => {
    setIsModalOpen(false);
    setSelectedChat(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const { currentUser } = useContext(AuthContext);

  const { isPending, data, error } = useQuery({
    queryKey: ['ChatList'],
    queryFn: async () => {
      try {
        if (!currentUser?.id) {
          return { response: [] };
        }

        const response = await axios.get('http://localhost:3000/ai/userChats', {
          withCredentials: true,
          params: {
            userId: currentUser.id,
          },
        });

        return response.data;
      } catch (err) {
        if (err.response && err.response.status === 404) {
          return { response: [] };
        }
        throw err;
      }
    },
    enabled: !!currentUser?.id,
  });

  const handleEdit = async (chatId, newTitle) => {
    if (newTitle && newTitle.trim()) {
      try {
        await axios.put(
          `http://localhost:3000/ai/chat/${chatId}`,
          {
            title: newTitle,
          },
          {
            withCredentials: true,
          }
        );
        toast.success('Chat title updated successfully');
        await queryClient.invalidateQueries(['ChatList']);
      } catch (e) {
        console.error('Error updating chat', e);
        toast.error('Error updating chat', e);
      }
    }
    setEditingChatId(null);
  };

  const handleDelete = async chat => {
    closeDeleteModel();

    if (location.pathname.includes(chat.id)) {
      navigate('/home');
    }

    try {
      await axios.delete(`http://localhost:3000/ai/chat/${chat.id}`, {
        withCredentials: true,
      });
      toast.success('Chat deleted successfully');
      await queryClient.invalidateQueries(['ChatList']);
    } catch (e) {
      console.error('Error deleting chat', e);
      toast.error(`Error deleting chat: ${e.response?.data?.error || e.message}`);
    }
  };

  const isActive = path => location.pathname === path;
  const chats = useMemo(() => data?.response || [], [data]);

  // Sort chats by the newest first
  const sortedChats = chats.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Group chats by month-year
  const groupedChats = {};
  sortedChats.forEach(chat => {
    const dateObj = new Date(chat.createdAt);
    const monthYear = dateObj.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    if (!groupedChats[monthYear]) {
      groupedChats[monthYear] = [];
    }
    groupedChats[monthYear].push(chat);
  });

  const customChats = useMemo(() => {
    return chats.filter(chat => chat.type === 'custom_template').slice(0, 5); // Limit to 5 recent custom chats
  }, [chats]);

  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(func, args);
      }, delay);
    };
  };

  const debouncedSearch = useRef(
    debounce(query => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setSearchResults([]);
      }
    }, 300)
  ).current;

  const performSearch = async query => {
    setIsSearching(true);
    setSelectedChat(false);

    try {
      const response = await axios.get('http://localhost:3000/ai/searchChat', {
        withCredentials: true,
        params: {
          userId: currentUser.id,
          searchQuery: query,
        },
      });
      setSearchResults(response.data.response);
    } catch (error) {
      console.error('Error searching chats:', error);
      toast.error('Error searching chats');
    } finally {
      setIsSearching(false);
      setSearchAttempted(true);
    }
  };

  const handleSearchInputChange = e => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  return (
    <>
      <DeleteModal
        isOpen={isModalOpen}
        onConfirm={() => handleDelete(selectedChat)}
        onClose={closeDeleteModel}
      />

      <button className="menu-button" onClick={toggleSidebar}>
        <Menu />
      </button>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <div className={`chatList ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <button className="menu-close-button" onClick={() => setIsSidebarOpen(false)}>
          <X size={24} />
        </button>

        <Link
          to="/translate"
          className={`utility-link ${isActive('/translate') ? 'active' : ''}`}
          onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
        >
          <Languages /> Translate a text
        </Link>
        <Link
          to="/format"
          className={`utility-link ${isActive('/format') ? 'active' : ''}`}
          onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
        >
          <Text /> Create an alternative text
        </Link>
        <Link
          to="/summarize"
          className={`utility-link ${isActive('/summarize') ? 'active' : ''}`}
          onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
        >
          <FileText /> Summarize a file
        </Link>
        <Link
          to="/new-prompt"
          className={`utility-link ${isActive('/new-prompt') ? 'active' : ''}`}
          onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
        >
          <CirclePlus /> New Prompt
        </Link>

        {/* Display custom chat utility links */}
        {customChats.map(chat => (
          <Link
            key={chat.id}
            to={`/template/${chat.id}`}
            className={`utility-link custom-utility-link ${
              isActive(`/template/${chat.id}`) ? 'active' : ''
            }`}
            onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
          >
            <User /> {chat.title}
          </Link>
        ))}

        <h1>Chat List {searchResults.length > 0 && `- ${searchResults.length} results`}</h1>

        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search chats..."
              className="search-input"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
          </div>
          {searchQuery && (
            <button
              className="clear-search-button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div className="list">
          {isPending ? (
            <div className="loading-state">
              <LoadingState message="Loading chats..." />
            </div>
          ) : error ? (
            <div className="error-message">Something went wrong. Please try again later.</div>
          ) : chats.length === 0 ? (
            <div className="empty-state">
              No chats yet. Start a conversation to see your chat history.
            </div>
          ) : isSearching ? (
            <div className="loading-state">
              <LoadingState message="Searching chats..." />
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              <h2 className="monthYear">Search Results</h2>
              {searchResults.map(chat => {
                if (chat.type === 'custom_template') return null;
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
                  case 'custom_conversation':
                    chatPath = `/custom/chat/${chat.id}`;
                    break;
                  default:
                    chatPath = `/chat/${chat.id}`;
                }

                return (
                  <div className="chatsLinks" key={chat.id}>
                    <Link
                      to={chatPath}
                      className={location.pathname === chatPath ? 'active-chat' : ''}
                    >
                      <div className="chat-item">
                        {editingChatId === chat.id ? (
                          <form
                            onSubmit={e => {
                              e.preventDefault();
                              handleEdit(chat.id, editingTitle);
                            }}
                          >
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={e => setEditingTitle(e.target.value)}
                              onBlur={() => handleEdit(chat.id, editingTitle)}
                              autoFocus
                            />
                          </form>
                        ) : (
                          <>
                            <span>{chat.title}</span>
                            <div className="chat-icons" onClick={e => e.stopPropagation()}>
                              <Pencil
                                className="icon-edit-icon"
                                onClick={e => {
                                  e.preventDefault();
                                  startEditing(chat);
                                }}
                              />
                              <Trash2
                                className="icon-delete-icon"
                                onClick={e => {
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
          ) : searchQuery && searchAttempted ? (
            <div className="empty-state">No result found for "{searchQuery}"</div>
          ) : (
            Object.entries(groupedChats).map(([monthYear, group]) => (
              <div key={monthYear}>
                <h2 className="monthYear">{monthYear}</h2>
                {group.map(chat => {
                  if (chat.type === 'custom_template') return null;
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
                    case 'custom_conversation':
                      chatPath = `/custom/chat/${chat.id}`;
                      break;
                    default:
                      chatPath = `/chat/${chat.id}`;
                  }

                  return (
                    <div className="chatsLinks" key={chat.id}>
                      <Link
                        to={chatPath}
                        className={location.pathname === chatPath ? 'active-chat' : ''}
                      >
                        <div className="chat-item">
                          {editingChatId === chat.id ? (
                            <form
                              onSubmit={e => {
                                e.preventDefault();
                                handleEdit(chat.id, editingTitle);
                              }}
                            >
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={e => setEditingTitle(e.target.value)}
                                onBlur={() => handleEdit(chat.id, editingTitle)}
                                autoFocus
                              />
                            </form>
                          ) : (
                            <>
                              <span>{chat.title}</span>
                              <div className="chat-icons" onClick={e => e.stopPropagation()}>
                                <Pencil
                                  className="icon-edit-icon"
                                  onClick={e => {
                                    e.preventDefault();
                                    startEditing(chat);
                                  }}
                                />
                                <Trash2
                                  className="icon-delete-icon"
                                  onClick={e => {
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
          )}
        </div>
      </div>
    </>
  );
};

export default ChatList;
