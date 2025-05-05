import React, { useContext, useRef, useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { SendHorizontal } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { handleTextareaAutoResize } from '../../utils/TextAutoResize';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import AiResponse from '../../components/ai-response/AiResponse';
import './Custom.css';
import Skeleton from 'react-loading-skeleton';
import { toast } from 'react-hot-toast';

const Custom = ({ inputRef }) => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const endRef = useRef(null);
  const { id: chatId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const firstLetter = currentUser?.username.charAt(0).toUpperCase();
  const navigate = useNavigate();

  // Fetch conversation data
  const {
    data: chat,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/ai/chat/${chatId}`, {
          withCredentials: true,
        })
        .then(res => res.data.response)
        .catch(error => {
          if (error.response?.data?.unauthorized) {
            setUnauthorized(true);
          }
          throw error;
        }),
  });

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.history, pendingMessage, loading]);

  useEffect(() => {
    if (unauthorized) {
      toast.error("You don't have access to this chat");
      navigate('/home');
    }
  });

  // Mutation to add messages to conversation
  const mutation = useMutation({
    mutationFn: message => {
      setLoading(true);
      return axios
        .put(
          `http://localhost:3000/ai/chats/custom-conversation/${chatId}`,
          { message },
          { withCredentials: true }
        )
        .then(res => res.data.response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat', chatId]);
      setInputValue('');
      setPendingMessage(null);
    },
    onError: error => {
      console.error('Error sending message:', error);
      setPendingMessage(null);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleSend = event => {
    event.preventDefault();
    if (inputValue.trim() === '' || loading) return;

    setPendingMessage(inputValue);
    setInputValue('');

    mutation.mutate(inputValue);
  };

  const handleEditAiResponse = (messageIndex, messageId, editedText) => {
    // Create a copy of the current chat data for an optimistic update
    const previousData = queryClient.getQueryData(['chat', chatId]);

    // Apply optimistic update to show changes immediately
    if (previousData) {
      const updatedChat = { ...previousData };
      // Ensure we're working with a clean copy of the history array
      updatedChat.history = [...updatedChat.history];
      // Update the specific message
      updatedChat.history[messageIndex] = {
        ...updatedChat.history[messageIndex],
        text: editedText,
      };

      // Update the cache immediately
      queryClient.setQueryData(['chat', chatId], updatedChat);
    }

    // Send update to server
    axios
      .put(
        `http://localhost:3000/ai/edit-message/${chatId}/${messageId}`,
        { text: editedText },
        { withCredentials: true }
      )
      .then(() => {
        toast.success('Response updated successfully');
      })
      .catch(error => {
        toast.error('Failed to update response');
        console.error('Edit error:', error);

        // Revert to original data on error
        if (previousData) {
          queryClient.setQueryData(['chat', chatId], previousData);
        }
      });
  };

  const handleInputChange = e => {
    handleTextareaAutoResize(e, setInputValue);
  };

  if (isLoading) return <LoadingState message="Loading conversation..." />;

  return (
    <div className="message">
      <div className="container-message" ref={inputRef}>
        <div className="chat">
          <div className="message-content-wrapper">
            {chat?.history?.map((message, index) => (
              <div key={index} className="message-container">
                {message.role === 'user' ? (
                  <>
                    <div className="user-message">{message.text}</div>
                    <div className="avatar user-avatar">{firstLetter}</div>
                  </>
                ) : (
                  <>
                    <div className="avatar model-avatar">
                      <img src="/vsb-logo.jpg" alt="vsb-logo" />
                    </div>
                    <div className="model-message">
                      <AiResponse
                        text={message.text}
                        showEditButton={true}
                        showEmailButton={true}
                        onEdit={editedText => handleEditAiResponse(index, message.id, editedText)}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Show a pending user message immediately */}
            {pendingMessage && (
              <div className="message-container">
                <div className="user-message">{pendingMessage}</div>
                <div className="avatar user-avatar">{firstLetter}</div>
              </div>
            )}

            {/* Show AI loading state */}
            {loading && (
              <div className="message-container">
                <div className="avatar model-avatar">
                  <img src="/vsb-logo.jpg" alt="vsb-logo" />
                </div>
                <div className="model-message">
                  <Skeleton width="10rem" />
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>

        <div className="document-input-prompt">
          <form onSubmit={handleSend}>
            <div className="custom-input-container">
              <textarea
                rows={1}
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Continue the conversation..."
                disabled={loading}
              />
              <button type="submit" disabled={loading || !inputValue.trim()}>
                <SendHorizontal className="send-button" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Custom;
