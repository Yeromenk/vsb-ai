import './Format.css';
import { SendHorizontal } from 'lucide-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import { AuthContext } from '../../context/AuthContext';

const Format = ({ data }) => {
  const [style, setStyle] = useState('Simple');
  const [tone, setTone] = useState('Formal');
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const [messages, setMessages] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const firstLetter = currentUser?.username.charAt(0).toUpperCase();

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data, messages, response]);

  const handleStyleChange = newStyle => {
    setStyle(newStyle);
    setIsStyleDropdownOpen(false);
  };

  const handleToneChange = newTone => {
    setTone(newTone);
    setIsToneDropdownOpen(false);
  };

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => {
      return axios
        .put(
          `http://localhost:3000/ai/format/chat/${data.id}`,
          {
            message: messages.length ? messages : undefined,
            style,
            tone,
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
      const formatResponse = await axios.post('http://localhost:3000/ai/format', {
        message: text,
        style,
        tone,
      });

      const formattedText = formatResponse.data.formattedText;
      setResponse(formattedText);
      setLoading(false);
      mutation.mutate();
    } catch (error) {
      console.error('Error in handleSend:', error);
      toast.error('Error in formatting text. Please try again later.');
      setLoading(false);
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

      <div className="formating-text-container">
        <div className="formating-text">
          <div className="text-options">
            <div className="text-options-row">
              <div className="dropdown">
                <button
                  className="dropdown-toggle"
                  onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                >
                  <b>Style:</b> {style}
                </button>
                {isStyleDropdownOpen && (
                  <div className="dropdown-content">
                    <div className="dropdown-section">
                      <strong>Style</strong>
                      <ul>
                        <li onClick={() => handleStyleChange('Neutral')}>Neutral</li>
                        <li onClick={() => handleStyleChange('Creative')}>Creative</li>
                        <li onClick={() => handleStyleChange('Technical')}>Technical</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <div className="dropdown">
                <button
                  className="dropdown-toggle"
                  onClick={() => setIsToneDropdownOpen(!isToneDropdownOpen)}
                >
                  <b>Tone:</b> {tone}
                </button>
                {isToneDropdownOpen && (
                  <div className="dropdown-content">
                    <div className="dropdown-section">
                      <strong>Tone</strong>
                      <ul>
                        <li onClick={() => handleToneChange('Formal')}>Formal</li>
                        <li onClick={() => handleToneChange('Informal')}>Informal</li>
                        <li onClick={() => handleToneChange('Diplomatic')}>Diplomatic</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <button
                className="submit-button"
                onClick={handleSend}
                disabled={input.trim() === '' || loading}
              >
                Format <SendHorizontal className="button-icon" />
              </button>
            </div>
            <textarea
              className="text-input"
              placeholder="Enter your text here..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Format;
