import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { SendHorizontal } from 'lucide-react';
import { handleTextareaAutoResize } from '../../utils/TextAutoResize';
import { useChat } from '../../hooks/useChat';
import ChatMessages from '../../components/common/ChatMessages/ChatMessages';
import { toast } from 'react-hot-toast';

const Custom = ({ inputRef }) => {
  const [inputValue, setInputValue] = useState('');
  const { id: chatId } = useParams();
  const queryClient = useQueryClient();

  const {
    chat,
    isLoading,
    error,
    pendingMessage,
    setPendingMessage,
    loading,
    mutation,
    endRef,
    currentUser,
    unauthorized,
  } = useChat(chatId, 'custom');

  const handleSend = event => {
    event.preventDefault();
    if (inputValue.trim() === '' || loading) return;

    setPendingMessage(inputValue);
    mutation.mutate(inputValue);
    setInputValue('');
  };

  const handleEditAiResponse = (messageIndex, messageId, editedText) => {
    // a copy of the current chat data for an optimistic update
    const previousData = queryClient.getQueryData(['chat', chatId]);

    // Apply optimistic update to show changes immediately
    if (previousData) {
      const updatedChat = { ...previousData };
      updatedChat.history = [...updatedChat.history];
      updatedChat.history[messageIndex] = {
        ...updatedChat.history[messageIndex],
        text: editedText,
      };

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
        if (previousData) {
          queryClient.setQueryData(['chat', chatId], previousData);
        }
      });
  };

  const handleInputChange = e => {
    handleTextareaAutoResize(e, setInputValue);
  };

  return (
    <div className="message">
      <div className="container-message" ref={inputRef}>
        <div className="chat">
          <ChatMessages
            chat={chat}
            isLoading={isLoading}
            error={error}
            unauthorized={unauthorized}
            pendingMessage={pendingMessage}
            loading={loading}
            endRef={endRef}
            currentUser={currentUser}
            onEditAiResponse={handleEditAiResponse}
            showEditButton={true}
            showEmailButton={true}
          />
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
