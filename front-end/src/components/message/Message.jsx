import React, { useRef, useEffect, useState } from 'react';
import './Message.css';
import { useParams } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import ChatMessages from '../chat-messages/ChatMessages';
import Translate from '../../pages/translate/Translate';
import Format from '../../pages/format/Format';
import Summarize from '../../pages/summarize/Summarize';
import Custom from '../../pages/custom/Custom';
import Email from '../../pages/email/Email';

const Message = ({ type }) => {
  const { id: chatId } = useParams();
  const inputRef = useRef(null);
  const [inputHeight, setInputHeight] = useState(0);

  const {
    chat,
    isLoading,
    error,
    pendingMessage,
    setPendingMessage,
    loading: isAiLoading,
    setLoading: setIsAiLoading,
    endRef,
    currentUser,
    unauthorized,
  } = useChat(chatId, type);

  // Measure input height for responsive layout
  useEffect(() => {
    if (inputRef.current) {
      const height = inputRef.current.offsetHeight;
      setInputHeight(height);

      const chatElement = document.querySelector('.chat');
      if (chatElement) {
        chatElement.style.maxHeight = `calc(100vh - ${Math.max(240, height + 120)}px)`;
      }
    }
  }, [chat?.type]);

  return (
    <div className="message">
      <div className="container-message">
        <div className="chat">
          <ChatMessages
            chat={chat}
            isLoading={isLoading}
            error={error}
            unauthorized={unauthorized}
            pendingMessage={pendingMessage}
            loading={isAiLoading}
            endRef={endRef}
            currentUser={currentUser}
            showEditButton={type === 'email'}
            showEmailButton={type === 'email'}
          />
        </div>

        {chat &&
          (type === 'translate' ? (
            <Translate
              data={chat}
              setPendingMessage={setPendingMessage}
              setIsAiLoading={setIsAiLoading}
              inputRef={inputRef}
            />
          ) : type === 'format' ? (
            <Format
              data={chat}
              setPendingMessage={setPendingMessage}
              setIsAiLoading={setIsAiLoading}
              inputRef={inputRef}
            />
          ) : type === 'file' ? (
            <Summarize
              data={chat}
              setPendingMessage={setPendingMessage}
              setIsAiLoading={setIsAiLoading}
              inputRef={inputRef}
            />
          ) : type === 'email' ? (
            <Email
              data={chat}
              setPendingMessage={setPendingMessage}
              setIsAiLoading={setIsAiLoading}
              inputRef={inputRef}
            />
          ) : type === 'custom' ? (
            <Custom inputRef={inputRef} />
          ) : null)}
      </div>
    </div>
  );
};

export default Message;
