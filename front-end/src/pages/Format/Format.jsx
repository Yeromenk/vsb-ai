import './Format.css';
import { ChevronDown, SendHorizontal } from 'lucide-react';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const Format = ({
                  data,
                  setPendingMessage,
                  setIsAiLoading,
                }) => {
  const [style, setStyle] = useState('Simple');
  const [tone, setTone] = useState('Formal');
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const maxChars = 2000;
  const queryClient = useQueryClient();

  const handleStyleChange = newStyle => {
    setStyle(newStyle);
    setIsStyleDropdownOpen(false);
  };

  const handleToneChange = newTone => {
    setTone(newTone);
    setIsToneDropdownOpen(false);
  };

  const mutation = useMutation({
    mutationFn: (formData) => {
      return axios
        .put(
          `http://localhost:3000/ai/format/chat/${data.id}`,
          formData,
          {
            withCredentials: true,
          },
        );
    },
    onSuccess : () => {
      queryClient.invalidateQueries(['chat', data.id])
                 .then(() => {
                   setPendingMessage(null);
                   setIsAiLoading(false);
                   setInput('');
                 });
    },
    onError   : error => {
      console.error('Error in handleSend:', error);
      toast.error('Error updating chat history');
      setPendingMessage(null);
      setIsAiLoading(false);
    },
    onSettled : () => {
      setLoading(false);
    },
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSend(e);
    }
  };

  const handleSend = async event => {
    event.preventDefault();
    if (input.trim() === '' || loading) return;

    // Show pending message immediately
    setPendingMessage(input);
    // Show AI is thinking
    setIsAiLoading(true);
    setLoading(true);

    try {
      mutation.mutate({
        message: input,
        style,
        tone,
      });

      setInput('');
    } catch (error) {
      console.error('Error in formatting:', error);
      toast.error('Error in formatting text. Please try again later.');
      setPendingMessage(null);
      setIsAiLoading(false);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  const closeDropdowns = (e) => {
    if (!e.target.closest('.format-dropdown')) {
      setIsStyleDropdownOpen(false);
      setIsToneDropdownOpen(false);
    }
  };

  return (
    <div className="format-page-container">
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
  );
};

export default Format;
