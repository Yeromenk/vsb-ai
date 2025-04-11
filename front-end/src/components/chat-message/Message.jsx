import React, { useContext } from 'react';
import './Message.css';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Translate from '../../pages/Translate/Translate';
import Format from '../../pages/Format/Format';
import Summarize from '../../pages/Summarize/Summarize';
import CustomInput from '../../features/custom/CustomInput';
import LoadingState from '../common/LoadingState/LoadingState';
import AiResponse from '../ai-response/AiResponse';

const Message = ({ type }) => {
  const { currentUser } = useContext(AuthContext);
  const firstLetter = currentUser?.username.charAt(0)
                                 .toUpperCase();
  const path = useLocation().pathname;
  const chatId = path.split('/')
                     .pop();

  const {
    isPending,
    data,
    error,
  } = useQuery({
    queryKey: ['chat', chatId],
    queryFn : () =>
      axios
        .get(`http://localhost:3000/ai/chat/${chatId}`, {
          withCredentials: true,
        })
        .then(res => res.data.response),
  });

  return (
    <div className="message">
      <div className="container-message">
        <div className="chat">
          {isPending
            ? <LoadingState message="Loading..." />
            : error
              ? 'An error occurred'
              : data?.history?.map((message,
                                    index) => (
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
        </div>

        {data &&
          (type === 'translate' ? (
            <Translate data={data} />
          ) : type === 'format' ? (
            <Format data={data} />
          ) : type === 'file' ? (
            <Summarize data={data} />
          ) : type === 'custom' ? (
            <CustomInput templateId={data.id} />
          ) : null)}
      </div>
    </div>
  );
};

export default Message;