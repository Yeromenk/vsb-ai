import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import './TextTranslator.css';

const TextTranslator = ({
                          onSubmit,
                          loading = false,
                          initialSource = 'English',
                          initialTarget = 'Spanish',
                        }) => {
  const [sourceLanguage, setSourceLanguage] = useState(initialSource);
  const [targetLanguage, setTargetLanguage] = useState(initialTarget);
  const [input, setInput] = useState('');
  const maxChars = 1000;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '' || input.length > maxChars) return;

    onSubmit({
      text: input,
      sourceLanguage,
      targetLanguage,
    });

    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="translator-container">
      <div className="language-selection">
        <div className="language-controls">
          <LanguageSelector
            selectedLanguage={sourceLanguage}
            onChange={(lang) => setSourceLanguage(lang)}
          />
          <ArrowRight className="arrow-icon" />
          <LanguageSelector
            selectedLanguage={targetLanguage}
            onChange={(lang) => setTargetLanguage(lang)}
          />
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || !input.trim() || input.length > maxChars}
        >
          Translate <ArrowRight size={16} />
        </button>
      </div>

      <div className="text-input-container">
        <textarea
          className="text-input"
          placeholder="Enter text to translate..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={maxChars + 10}
          disabled={loading}
        ></textarea>
        <div className="char-counter">
          {input.length}/{maxChars}
        </div>
      </div>
    </div>
  );
};

export default TextTranslator;