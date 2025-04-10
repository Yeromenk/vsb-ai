// pages/Translate/Translate.jsx
import { useContext, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast from 'react-hot-toast';
import TextTranslator from '../../components/common/TextTranslator/TextTranslator';
import './Translate.css';

const Translate = ({ data }) => {
  const [messages, setMessages] = useState('');
  const [response, setResponse] = useState('');
  const endRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const firstLetter = currentUser?.username.charAt(0)
                                 .toUpperCase();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (endRef.current) {
      // Using setTimeout ensures DOM updates before scrolling
      setTimeout(() => {
        endRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, response, data?.messages]); // Add data?.messages as dependency

  const mutation = useMutation({
    mutationFn: () => {
      return axios.put(
        `http://localhost:3000/ai/translate/chat/${data.id}`,
        {
          message       : messages.length ? messages : undefined,
          sourceLanguage: data.sourceLanguage,
          targetLanguage: data.targetLanguage,
        },
        {
          withCredentials: true,
        },
      );
    },
    onSuccess : () => {
      queryClient.invalidateQueries({ queryKey: ['chat', data.id] })
                 .then(() => {
                   setMessages('');
                   setResponse('');
                 });
    },
    onError   : error => {
      console.error('Error in handleSend:', error);
    },
  });

  const handleTranslate = async ({
                                   text,
                                   sourceLanguage,
                                   targetLanguage,
                                 }) => {
    setLoading(true);
    setMessages(text);

    try {
      const translationResponse = await axios.post('http://localhost:3000/ai/translate', {
        message: text,
        sourceLanguage,
        targetLanguage,
      });

      const translatedText = translationResponse.data.translatedText;
      setResponse(translatedText);
      mutation.mutate();
    } catch (error) {
      console.error('Error in translation:', error);
      toast.error('Error in translating text. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="translate-page">
      <div className="chat">
        {data?.messages?.map((msg, index) => (
          <div className="message-container" key={index}>
            {msg.isBot || msg.role === "assistant" ? (
              <>
                <div className="avatar model-avatar">
                  <img src="/vsb-logo.jpg" alt="vsb-logo" />
                </div>
                <div className="message model-message">{msg.content}</div>
              </>
            ) : (
              <>
                <div className="message user-message">{msg.content}</div>
                <div className="avatar user-avatar">{firstLetter}</div>
              </>
            )}
          </div>
        ))}

        {messages && !data?.messages?.some(msg => msg.content === messages) && (
          <div className="message-container">
            <div className="message user-message">{messages}</div>
            <div className="avatar user-avatar">{firstLetter}</div>
          </div>
        )}

        {loading ? (
          <div className="message-container">
            <div className="avatar model-avatar">
              <img src="/vsb-logo.jpg" alt="vsb-logo" />
            </div>
            <div className="message model-message">
              <Skeleton width="10rem" />
            </div>
          </div>
        ) : (
          response && !data?.messages?.some(msg => msg.content === response) && (
            <div className="message-container">
              <div className="avatar model-avatar">
                <img src="/vsb-logo.jpg" alt="vsb-logo" />
              </div>
              <div className="message model-message">{response}</div>
            </div>
          )
        )}
        <div ref={endRef} /> {/* Reference element for scrolling */}
      </div>

      <div className="translator-wrapper">
        <TextTranslator
          onSubmit={handleTranslate}
          loading={loading}
          initialSource={data?.sourceLanguage || 'English'}
          initialTarget={data?.targetLanguage || 'Spanish'}
        />
      </div>
    </div>
  );
};

export default Translate;