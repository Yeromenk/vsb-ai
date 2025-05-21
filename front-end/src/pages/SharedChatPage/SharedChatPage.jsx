import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import ChatMessages from '../../components/common/ChatMessages/ChatMessages';
import MessageInput from '../../components/common/MessageInput/MessageInput';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import './SharedChatPage.css';
import TextTranslator from '../../components/common/TextTranslator/TextTranslator';
import FormatControls from '../../components/common/FormatControls/FormatControls';
import FileProcessing from '../../components/common/FileProcessing/FileProcessing';

const SharedChatPage = () => {
  const { shareCode } = useParams();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchSharedChat = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/ai/shared/${shareCode}`);
        setChat(response.data.chat);
      } catch (err) {
        setError('This shared chat is not available or has been removed');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedChat();
  }, [shareCode]);

  // Responsive chat height
  useEffect(() => {
    const updateChatHeight = () => {
      if (inputRef.current) {
        const height = inputRef.current.offsetHeight;
        const chatElement = document.querySelector('.chat');
        if (chatElement) {
          chatElement.style.maxHeight = `calc(100vh - ${Math.max(320, height + 170)}px)`;
        }
      }
    };
    updateChatHeight();
    window.addEventListener('resize', updateChatHeight);
    return () => window.removeEventListener('resize', updateChatHeight);
  }, [chat, inputRef.current]);

  // Add this near your other useEffect hooks
  useEffect(() => {
    // Scroll to bottom when messages update
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.history]);

  const handleSendMessage = async data => {
    const message = typeof data === 'string' ? data : data?.text;
    if (!chat || !message?.trim() || chat.sharePermission !== 'edit') return;

    // Use a truly unique ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create temporary user message
    const tempUserMessage = {
      id: tempId,
      role: 'user',
      text: message,
      chatId: chat.id,
      tempId: tempId, // Extra identifier to ensure we can find it later
    };

    // Add temporary message to chat
    setChat(prev => ({
      ...prev,
      history: [...prev.history, tempUserMessage],
    }));

    setPendingMessage(message);
    setSendingMessage(true);

    try {
      // Prepare request data based on chat type
      let requestData = { message };
      if (chat.type === 'translate' && typeof data === 'object') {
        requestData = {
          message: data.text,
          sourceLanguage: data.sourceLanguage,
          targetLanguage: data.targetLanguage,
        };
      } else if (chat.type === 'format' && typeof data === 'object') {
        requestData = {
          message: data.text,
          style: data.style || chat.style || 'Simple',
          tone: data.tone || chat.tone || 'Formal',
        };
      }

      const response = await axios.post(
        `http://localhost:3000/ai/shared/${shareCode}/message`,
        requestData
      );

      if (response.data.newMessages && Array.isArray(response.data.newMessages)) {
        setChat(prev => {
          // Only remove our specific temporary message by its tempId
          const filteredHistory = prev.history.filter(msg => !msg.tempId || msg.tempId !== tempId);

          return {
            ...prev,
            history: [...filteredHistory, ...response.data.newMessages],
          };
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temporary message on error
      setChat(prev => ({
        ...prev,
        history: prev.history.filter(msg => !msg.tempId || msg.tempId !== tempId),
      }));
      alert('Failed to send message. Please try again.');
    } finally {
      setPendingMessage('');
      setSendingMessage(false);
    }
  };

  if (loading) return <LoadingState message="Loading shared chat..." />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="message">
      <div className="container-message">
        <div className="shared-permission-badge">
          {chat.sharePermission === 'edit' ? 'Editable Shared Chat' : 'View-only Shared Chat'}
        </div>

        <div className="chat">
          <ChatMessages
            chat={chat}
            pendingMessage={pendingMessage}
            loading={sendingMessage}
            endRef={endRef}
            currentUser={currentUser}
          />
        </div>

        {chat.sharePermission === 'edit' && (
          <div className="format-page-container" ref={inputRef}>
            {chat.type === 'translate' ? (
              <TextTranslator
                onSubmit={data =>
                  handleSendMessage({
                    text: data.text,
                    sourceLanguage: data.sourceLanguage,
                    targetLanguage: data.targetLanguage,
                  })
                }
                loading={sendingMessage}
                buttonText="Translate"
                isUpdate={true}
              />
            ) : chat.type === 'file' ? (
              <FileProcessing
                onSubmit={data => handleSendMessage(data)}
                loading={sendingMessage}
                buttonText="Process File"
                isUpdate={true}
              />
            ) : chat.type === 'format' ? (
              <FormatControls
                onSubmit={data =>
                  handleSendMessage({
                    text: data.message,
                    style: data.style,
                    tone: data.tone,
                  })
                }
                loading={sendingMessage}
                initialStyle={chat?.style || 'Simple'}
                initialTone={chat?.tone || 'Formal'}
              />
            ) : (
              <MessageInput onSendMessage={handleSendMessage} disabled={sendingMessage} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedChatPage;
