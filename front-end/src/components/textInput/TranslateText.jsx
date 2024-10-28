import './translateText.css';
import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';

const TranslateText = () => {
    const [sourceLanguage, setSourceLanguage] = useState('English');
    const [targetLanguage, setTargetLanguage] = useState('Spanish');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const handleLanguageChange = (newLanguage, type) => {
        if (type === 'source') {
            setSourceLanguage(newLanguage);
        } else {
            setTargetLanguage(newLanguage);
        }
        setIsDropdownOpen(false);
        setActiveDropdown(null);
    };

    const toggleDropdown = (type) => {
        setIsDropdownOpen((prev) => !prev);
        setActiveDropdown((prev) => (prev === type ? null : type));
    };

    return (
        <div className='translate-text'>
            <div className="container">
                <div className="language-selection">
                    <div className="dropdown">
                        <button
                            className="dropbtn"
                            onClick={() => toggleDropdown('source')}
                        >
                            {sourceLanguage} <ChevronDown />
                        </button>
                        {isDropdownOpen && activeDropdown === 'source' && (
                            <div className="dropdown-content">
                                <ul>
                                    <li onClick={() => handleLanguageChange('English', 'source')}>English</li>
                                    <li onClick={() => handleLanguageChange('Spanish', 'source')}>Spanish</li>
                                    <li onClick={() => handleLanguageChange('French', 'source')}>French</li>
                                    <li onClick={() => handleLanguageChange('German', 'source')}>German</li>
                                    <li onClick={() => handleLanguageChange('Italian', 'source')}>Italian</li>
                                    <li onClick={() => handleLanguageChange('Russian', 'source')}>Russian</li>
                                    <li onClick={() => handleLanguageChange('Chinese', 'source')}>Chinese</li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <ArrowRight className="arrow-icon" />
                    <div className="dropdown">
                        <button
                            className="dropbtn"
                            onClick={() => toggleDropdown('target')}
                        >
                            {targetLanguage} <ChevronDown />
                        </button>
                        {isDropdownOpen && activeDropdown === 'target' && (
                            <div className="dropdown-content">
                                <ul>
                                    <li onClick={() => handleLanguageChange('English', 'target')}>English</li>
                                    <li onClick={() => handleLanguageChange('Spanish', 'target')}>Spanish</li>
                                    <li onClick={() => handleLanguageChange('French', 'target')}>French</li>
                                    <li onClick={() => handleLanguageChange('German', 'target')}>German</li>
                                    <li onClick={() => handleLanguageChange('Italian', 'target')}>Italian</li>
                                    <li onClick={() => handleLanguageChange('Russian', 'target')}>Russian</li>
                                    <li onClick={() => handleLanguageChange('Chinese', 'target')}>Chinese</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <textarea className='text-input' placeholder='Enter text to translate'></textarea>
                <button className="submit-btn">
                    Translate <ArrowRight />
                </button>
            </div>
        </div>
    );
};

export default TranslateText;
