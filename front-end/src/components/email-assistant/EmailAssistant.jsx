import { useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import './EmailAssistant.css';

const EmailAssistant = ({ onSubmit, loading = false, data }) => {
  const [input, setInput] = useState('');
  const maxChars = 2000;

  const handleSubmit = e => {
    e.preventDefault();
    if (input.trim() === '' || input.length > maxChars) return;

    onSubmit({
      message: input,
    });

    setInput('');
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="email-assistant-container">
      <div className="document-input-prompt">
        <form onSubmit={handleSubmit}>
          <div className="custom-input-container">
            <textarea
              rows={3}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste the email content here and explain how you want to respond..."
              disabled={loading}
              aria-label="Email content input"
            />
            <div className="char-counter-input">
              {input.length}/{maxChars}
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim() || input.length > maxChars}
              aria-label="Generate response"
            >
              <SendHorizontal className="send-button" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailAssistant;
