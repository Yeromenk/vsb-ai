import React, { useContext, useState } from 'react';
import './FormatInput.css';
import { SendHorizontal, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FormatInput = () => {
  const [style, setStyle] = useState('Simple');
  const [tone, setTone] = useState('Formal');
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const [input, setInput] = useState('');
  const maxChars = 2000;

  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser.id;

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
    mutationFn: async text => {
      const response = await axios.post('http://localhost:3000/ai/chats', {
        message: text,
        style,
        tone,
        userId,
      });
      return response.data.response;
    },
    onSuccess: newChat => {
      queryClient.invalidateQueries({ queryKey: ['ChatList'] });
      navigate(`/format/chat/${newChat.id}`);
    },
    onError: error => {
      console.error('Error in handleSend:', error);
    },
  });

  const handleSend = async event => {
    event.preventDefault();
    if (input.trim() === '' || input.length > maxChars) return;

    mutation.mutate(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSend(e);
    }
  };

  const closeDropdowns = (e) => {
    if (!e.target.closest('.format-dropdown')) {
      setIsStyleDropdownOpen(false);
      setIsToneDropdownOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  return (
    <div className="format-page">
      <div className="format-container">
        <div className="format-header">
          <h1 className="format-header__title">Format a text</h1>
          <p className="format-header__subtitle">Improve your writing with AI-powered formatting</p>
        </div>

        <div className="format-panel">
          <div className="format-controls">
            <div className="format-dropdown">
              <button
                className="dropdown-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStyleDropdownOpen(!isStyleDropdownOpen);
                  setIsToneDropdownOpen(false);
                }}
              >
                <b>Style:</b> {style} <ChevronDown size={16} />
              </button>
              {isStyleDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-section">
                    <div className="dropdown-section-header">Writing Style</div>
                    <ul className="dropdown-option-list">
                      <li className="dropdown-option" onClick={() => handleStyleChange('Simple')}>Simple</li>
                      <li className="dropdown-option" onClick={() => handleStyleChange('Neutral')}>Neutral</li>
                      <li className="dropdown-option" onClick={() => handleStyleChange('Creative')}>Creative</li>
                      <li className="dropdown-option" onClick={() => handleStyleChange('Technical')}>Technical</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="format-dropdown">
              <button
                className="dropdown-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsToneDropdownOpen(!isToneDropdownOpen);
                  setIsStyleDropdownOpen(false);
                }}
              >
                <b>Tone:</b> {tone} <ChevronDown size={16} />
              </button>
              {isToneDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-section">
                    <div className="dropdown-section-header">Writing Tone</div>
                    <ul className="dropdown-option-list">
                      <li className="dropdown-option" onClick={() => handleToneChange('Formal')}>Formal</li>
                      <li className="dropdown-option" onClick={() => handleToneChange('Informal')}>Informal</li>
                      <li className="dropdown-option" onClick={() => handleToneChange('Diplomatic')}>Diplomatic</li>
                      <li className="dropdown-option" onClick={() => handleToneChange('Persuasive')}>Persuasive</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <button
              className="format-submit-button"
              onClick={handleSend}
              disabled={input.trim() === '' || input.length > maxChars || mutation.isPending}
            >
              Format <SendHorizontal className="button-icon" />
            </button>
          </div>

          <div className="format-input-container">
            <textarea
              className="format-textarea"
              placeholder="Enter your text here..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={mutation.isPending}
            />
            <div className="char-counter">
              {input.length}/{maxChars}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormatInput;