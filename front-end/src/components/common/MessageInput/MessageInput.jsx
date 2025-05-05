import React, { useState, useCallback } from 'react';
import { SendHorizontal } from 'lucide-react';
import { handleTextareaAutoResize } from '../../../utils/TextAutoResize';
import './MessageInput.css';

const MessageInput = ({
  onSubmit,
  loading = false,
  initialValue = '',
  placeholder = 'Start a new conversation...',
  title = '',
  description = '',
  showHeader = true,
}) => {
  const [inputValue, setInputValue] = useState(initialValue);

  const handleSend = useCallback(
    event => {
      event?.preventDefault();
      if (inputValue.trim() === '' || loading) return;
      onSubmit(inputValue);
      setInputValue('');
    },
    [inputValue, loading, onSubmit]
  );

  const handleInputChange = useCallback(e => {
    handleTextareaAutoResize(e, setInputValue);
  }, []);

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleSend(e);
      }
    },
    [handleSend]
  );

  return (
    <div className="message-input">
      {showHeader && (
        <div className="message-input__header">
          {title && <h1>{title}</h1>}
          {description && <p className="message-input__description">{description}</p>}
        </div>
      )}

      <div className="document-input-prompt">
        <form onSubmit={handleSend}>
          <div className="custom-input-container">
            <textarea
              rows={1}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={loading}
              aria-label="Message input"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              aria-label="Send message"
            >
              <SendHorizontal className="send-button" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
