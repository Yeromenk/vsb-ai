import { useNavigate, useLocation } from 'react-router-dom';
import './ChatList.css';
import { Menu, X } from 'lucide-react';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import DeleteModal from '../../components/common/Modal/DeleteModal';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import ChatListContent from '../../components/common/ChatListContent/ChatListContent';
import UtilityLinks from '../../components/common/UtilityLinks/UtilityLinks';

const ChatList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useContext(AuthContext);

  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(func, args), delay);
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

  // Fetch chats
  const { isPending, data, error } = useQuery({
    queryKey: ['ChatList'],
    queryFn: async () => {
      try {
        if (!currentUser?.id) return { response: [] };

        const response = await axios.get('http://localhost:3000/ai/userChats', {
          withCredentials: true,
          params: { userId: currentUser.id },
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

  // Event handlers
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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

  const handleEdit = async (chatId, newTitle) => {
    if (newTitle && newTitle.trim()) {
      try {
        await axios.put(
          `http://localhost:3000/ai/chat/${chatId}`,
          { title: newTitle },
          { withCredentials: true }
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

  const performSearch = async query => {
    setIsSearching(true);
    setSearchAttempted(true);

    try {
      const response = await axios.get('http://localhost:3000/ai/semantic-search', {
        withCredentials: true,
        params: { query },
      });
      setSearchResults(response.data.response);
    } catch (error) {
      console.error('Error searching chats:', error);
      toast.error('Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = e => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Derived state
  const isActive = path => location.pathname === path;
  const chats = useMemo(() => data?.response || [], [data]);

  // Sort chats by the newest first
  const sortedChats = chats
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  // Group chats by month-year based on the most recent activity
  const groupedChats = {};
  sortedChats.forEach(chat => {
    // Use updatedAt if available, otherwise fall back to createdAt
    const latestDate = chat.updatedAt || chat.createdAt;
    const dateObj = new Date(latestDate);
    const monthYear = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    if (!groupedChats[monthYear]) {
      groupedChats[monthYear] = [];
    }
    groupedChats[monthYear].push(chat);
  });

  const customChats = useMemo(() => {
    return chats.filter(chat => chat.type === 'custom_template').slice(0, 5);
  }, [chats]);

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

        <UtilityLinks
          isActive={isActive}
          customChats={customChats}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <h1>Chat List {searchResults.length > 0 && `- ${searchResults.length} results`}</h1>

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearchInputChange={handleSearchInputChange}
          clearSearch={clearSearch}
        />

        <div className="list">
          <ChatListContent
            isPending={isPending}
            error={error}
            chats={chats}
            isSearching={isSearching}
            searchResults={searchResults}
            searchQuery={searchQuery}
            searchAttempted={searchAttempted}
            groupedChats={groupedChats}
            isActive={isActive}
            editingChatId={editingChatId}
            editingTitle={editingTitle}
            setEditingTitle={setEditingTitle}
            handleEdit={handleEdit}
            startEditing={startEditing}
            openDeleteModel={openDeleteModel}
          />
        </div>
      </div>
    </>
  );
};

export default ChatList;
