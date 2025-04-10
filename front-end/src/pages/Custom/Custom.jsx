import React, { useContext, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import { SendHorizontal } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Custom = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [input, setInput] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState('');
  const [response, setResponse] = useState('');
  const endRef = useRef(null);
  const firstLetter = currentUser?.username.charAt(0).toUpperCase();

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => {
      return axios
        .put(
          `http://localhost:3000/ai/custom/chat/${data.id}`,
          {
            message: messages,
          },
          {
            withCredentials: true,
          }
        )
        .then(res => res.data.response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', data.id] }).then(() => {
        setMessages('');
        setResponse('');
        setInput('');
      });
    },
    onError: error => {
      console.error('Error in handleSend:', error);
    },
  });

  const add = async (text, isInitial) => {
    if (text.trim() === '') return;

    setLoading(true);
    if (!isInitial) setMessages(text);

    try {
      const translationResponse = await axios.post('http://localhost:3000/ai/translate', {
        message: text,
      });

      const translatedText = translationResponse.data.translatedText;
      setResponse(translatedText);
      mutation.mutate();
    } catch (error) {
      console.error('Error in handleSend:', error);
      toast.error('Error in translating text. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async event => {
    event.preventDefault();
    if (!loading) {
      await add(input, false);
    }
  };

  const handleInputChange = e => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.overflowY = 'hidden';
    textarea.style.height = `${textarea.scrollHeight}px`;

    if (textarea.scrollHeight > 128) {
      textarea.style.overflowY = 'auto';
      textarea.style.height = '128px';
    }

    setInputValue(textarea.value);
  };

  return (
    <>
      <div className="chat">
        {messages && (
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
          response && (
            <div className="message-container">
              <div className="avatar model-avatar">
                <img src="/vsb-logo.jpg" alt="vsb-logo" />
              </div>
              <div className="message model-message">{response}</div>
            </div>
          )
        )}
        <div ref={endRef} />
      </div>

      <div className="user-prompt-container">
        <div className="user-prompt">
          <h1>{data?.title || 'Custom Chat'}</h1>
          {data?.description && <p className="description">{data.description}</p>}
        </div>
        <div className="document-input-prompt">
          <form onSubmit={handleSend}>
            <div className="input-container">
              <textarea
                rows={1}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onInput={handleInputChange}
                placeholder="What do you want to ask?"
                disabled={loading}
              />
              <button type="submit" disabled={loading || !inputValue.trim()}>
                <SendHorizontal className="send-button" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Custom;
