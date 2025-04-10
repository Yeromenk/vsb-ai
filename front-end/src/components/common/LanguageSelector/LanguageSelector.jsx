import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './LanguageSelector.css';

const LanguageSelector = ({
                            selectedLanguage,
                            onChange,
                            languages = ['English', 'Spanish', 'Italian', 'Russian']
                          }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (language) => {
    onChange(language);
    setIsOpen(false);
  };

  return (
    <div className="dropdown">
      <button className="dropbtn" onClick={() => setIsOpen(!isOpen)}>
        {selectedLanguage} <ChevronDown />
      </button>
      {isOpen && (
        <div className="dropdown-content">
          <ul>
            {languages.map(language => (
              <li key={language} onClick={() => handleSelect(language)}>
                {language}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;