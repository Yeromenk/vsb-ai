import React, { useState, useEffect } from 'react';
import { ChevronDown, SendHorizontal } from 'lucide-react';

const FormatControls = ({
                          onSubmit,
                          loading = false,
                          initialStyle = 'Simple',
                          initialTone = 'Formal',
                          buttonText = 'Format',
                          maxChars = 2000,
                        }) => {
  const [style, setStyle] = useState(initialStyle);
  const [tone, setTone] = useState(initialTone);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const [input, setInput] = useState('');

  const handleStyleChange = newStyle => {
    setStyle(newStyle);
    setIsStyleDropdownOpen(false);
  };

  const handleToneChange = newTone => {
    setTone(newTone);
    setIsToneDropdownOpen(false);
  };

  const handleSend = event => {
    event.preventDefault();
    if (input.trim() === '' || input.length > maxChars || loading) return;

    onSubmit({ message: input, style, tone });
    setInput('');
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSend(e);
    }
  };

  const closeDropdowns = e => {
    if (!e.target.closest('.format-dropdown')) {
      setIsStyleDropdownOpen(false);
      setIsToneDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  return (
    <div className="format-panel">
      <div className="format-controls">
        <div className="format-dropdown">
          <button
            className="dropdown-button"
            onClick={e => {
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
                  <li className="dropdown-option" onClick={() => handleStyleChange('Simple')}>
                    Simple
                  </li>
                  <li className="dropdown-option" onClick={() => handleStyleChange('Neutral')}>
                    Neutral
                  </li>
                  <li className="dropdown-option" onClick={() => handleStyleChange('Creative')}>
                    Creative
                  </li>
                  <li className="dropdown-option" onClick={() => handleStyleChange('Technical')}>
                    Technical
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="format-dropdown">
          <button
            className="dropdown-button"
            onClick={e => {
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
                  <li className="dropdown-option" onClick={() => handleToneChange('Formal')}>
                    Formal
                  </li>
                  <li className="dropdown-option" onClick={() => handleToneChange('Informal')}>
                    Informal
                  </li>
                  <li className="dropdown-option" onClick={() => handleToneChange('Diplomatic')}>
                    Diplomatic
                  </li>
                  <li className="dropdown-option" onClick={() => handleToneChange('Persuasive')}>
                    Persuasive
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <button
          className="format-submit-button"
          onClick={handleSend}
          disabled={input.trim() === '' || input.length > maxChars || loading}
        >
          {buttonText} <SendHorizontal className="button-icon" />
        </button>
      </div>

      <div className="format-input-container">
        <textarea
          className="format-textarea"
          placeholder="Enter your text here..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <div className="char-counter">
          {input.length}/{maxChars}
        </div>
      </div>
    </div>
  );
};

export default FormatControls;