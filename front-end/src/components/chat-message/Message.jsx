import React, { useContext, useState, useRef, useEffect } from 'react';
import './Message.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Translate from '../../pages/Translate/Translate';
import Format from '../../pages/Format/Format';
import Summarize from '../../pages/Summarize/Summarize';
import LoadingState from '../common/LoadingState/LoadingState';
import AiResponse from '../ai-response/AiResponse';
import Skeleton from 'react-loading-skeleton';
import Custom from '../../pages/Custom/Custom';
import { toast } from 'react-hot-toast';

const Message = ({ type }) => {
  const { currentUser } = useContext(AuthContext);
  const firstLetter = currentUser?.username.charAt(0).toUpperCase();
  const { id: chatId } = useParams();
  const endRef = useRef(null);

  // States for pending messages and loading
  const [pendingMessage, setPendingMessage] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const navigate = useNavigate();

  // Fetch conversation data
  const { data: chat, isLoading, error } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/ai/chat/${chatId}`, {
          withCredentials: true,
        })
        .then(res => res.data.response)
        .catch(error => {
          if(error.response?.data?.unauthorized){
            setUnauthorized(true);
          }
          throw error;
        })
  });

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.history, pendingMessage, isAiLoading]);

  useEffect(() => {
    if (unauthorized) {
      toast.error("You don't have access to this chat");
      navigate('/home');
    }
  })

  return (
    <div className="message">
      <div className="container-message">
        <div className="chat">
          <div className="message-content-wrapper">
            {isLoading
              ? <LoadingState message="Loading..." />
              : error
                ? (unauthorized ? null : <div className="error-state"> An error occurred </div>)
                : chat?.history?.map((message, index) => (
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
                          <AiResponse text={message.text} />
                        </div>
                      </>
                    )}
                  </div>
                ))}

            {/* Show pending user message */}
            {pendingMessage && (
              <div className="message-container">
                <div className="user-message">{pendingMessage}</div>
                <div className="avatar user-avatar">{firstLetter}</div>
              </div>
            )}

            {/* Show AI loading state */}
            {isAiLoading && (
              <div className="message-container">
                <div className="avatar model-avatar">
                  <img src="/vsb-logo.jpg" alt="vsb-logo" />
                </div>
                <div className="model-message">
                  <Skeleton width="10rem" />
                </div>
              </div>
            )}

            {/* Reference for scrolling to bottom */}
            <div ref={endRef} />
          </div>
        </div>

        {chat &&
          (type === 'translate' ? (
            <Translate
              data={chat}
              setPendingMessage={setPendingMessage}
              setIsAiLoading={setIsAiLoading}
            />
          ) : type === 'format' ? (
            <Format
              data={chat}
              setPendingMessage={setPendingMessage}
              setIsAiLoading={setIsAiLoading}
            />
          ) : type === 'file' ? (
            <Summarize
              data={chat}
              setPendingMessage={setPendingMessage}
              setIsAiLoading={setIsAiLoading}
            />
          ) : type === 'custom' ? (
            <Custom />
          ) : null)}
      </div>
    </div>
  );
};

export default Message;