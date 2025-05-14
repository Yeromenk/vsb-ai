import React, { useRef, useEffect, useState } from 'react';
import './Message.css';
import { useParams } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import ChatMessages from '../common/ChatMessages/ChatMessages';
import Translate from '../../pages/Translate/Translate';
import Format from '../../pages/Format/Format';
import Summarize from '../../pages/Summarize/Summarize';
import Custom from '../../pages/Custom/Custom';

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
        chatElement.style.maxHeight = `calc(100vh - ${Math.max(320, height + 120)}px)`;
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
            showEditButton={type === 'custom'}
            showEmailButton={type === 'custom'}
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
          ) : type === 'custom' ? (
            <Custom inputRef={inputRef} />
          ) : null)}
      </div>
    </div>
  );
};

export default Message;
