import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import './TextTranslator.css';

const TextTranslator = ({
                          onSubmit,
                          loading = false,
                          initialSource = 'English',
                          initialTarget = 'Spanish'
                        }) => {
  const [sourceLanguage, setSourceLanguage] = useState(initialSource);
  const [targetLanguage, setTargetLanguage] = useState(initialTarget);
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    onSubmit({
      text: input,
      sourceLanguage,
      targetLanguage
    });
  };

  return (
    <div className="translator-container">
      <div className="language-selection">
        <LanguageSelector
          selectedLanguage={sourceLanguage}
          onChange={(lang) => setSourceLanguage(lang)}
        />
        <ArrowRight className="arrow-icon" />
        <LanguageSelector
          selectedLanguage={targetLanguage}
          onChange={(lang) => setTargetLanguage(lang)}
        />
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
        >
          Translate <ArrowRight />
        </button>
      </div>

      <textarea
        className="text-input"
        placeholder="Enter text to translate"
        value={input}
        onChange={e => setInput(e.target.value)}
      ></textarea>
    </div>
  );
};

export default TextTranslator;