import { useState } from 'react';
import { ArrowRight, ArrowRightLeft } from 'lucide-react';
import LanguageSelector from '../language-selector/LanguageSelector';
import './TextTranslator.css';

const TextTranslator = ({
  onSubmit,
  loading = false,
  initialSource = 'English',
  initialTarget = 'Czech',
}) => {
  const [sourceLanguage, setSourceLanguage] = useState(initialSource);
  const [targetLanguage, setTargetLanguage] = useState(initialTarget);
  const [input, setInput] = useState('');
  const maxChars = 1000;

  const popularLanguages = [
    'English',
    'Czech',
    'German',
    'French',
    'Spanish',
    'Italian',
    'Russian',
  ];

  const handleSourceLanguageChange = lang => {
    setSourceLanguage(lang);

    if (lang === targetLanguage) {
      const alternativeLanguage = popularLanguages.find(l => l !== lang);
      setTargetLanguage(alternativeLanguage || 'English');
    }
  };

  const handleTargetLanguageChange = lang => {
    setTargetLanguage(lang);

    if (lang === sourceLanguage) {
      const alternativeLanguage = popularLanguages.find(l => l !== lang);
      setSourceLanguage(alternativeLanguage || 'Czech');
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (input.trim() === '' || input.length > maxChars) return;

    onSubmit({
      text: input,
      sourceLanguage,
      targetLanguage,
    });

    setInput('');
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  const swapLanguages = () => {
    const tempSource = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempSource);
  };

  return (
    <div className="translator-container">
      <div className="language-selection">
        <div className="language-controls">
          <LanguageSelector
            selectedLanguage={sourceLanguage}
            onChange={handleSourceLanguageChange}
          />

          <div className="language-controls-center">
            <ArrowRightLeft
              className="swap-languages-icon"
              size={30}
              onClick={swapLanguages}
              title="Swap languages"
            />
          </div>

          <LanguageSelector
            selectedLanguage={targetLanguage}
            onChange={handleTargetLanguageChange}
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
