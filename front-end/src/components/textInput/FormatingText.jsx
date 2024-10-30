import { useState } from 'react';
import './formatingText.css';
import { SendHorizontal } from 'lucide-react';
import axios from 'axios';

const FormatingText = () => {
    const [style, setStyle] = useState('Simple');
    const [tone, setTone] = useState('Formal');
    const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
    const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
    const [input, setInput] = useState('');

    const handleStyleChange = (newStyle) => {
        setStyle(newStyle);
        setIsStyleDropdownOpen(false);
    };

    const handleToneChange = (newTone) => {
        setTone(newTone);
        setIsToneDropdownOpen(false);
    };

    const handleSend = async () => {
        try {
            const response = await axios.post('http://localhost:3000/ai/format', {
                message: input,
                style,
                tone
            });
            console.log("AI Response:", response.data.response);
        } catch (e) {
            console.error("Error in handleSend:", e);
        }
    };

    return (
        <div className='formating-text-container'>
            <div className='text-options'>
                <div className='dropdown'>
                    <button className='dropdown-toggle' onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}>
                        <b>Style:</b> {style}
                    </button>
                    {isStyleDropdownOpen && (
                        <div className='dropdown-content'>
                            <div className='dropdown-section'>
                                <strong>Style</strong>
                                <ul>
                                    <li onClick={() => handleStyleChange('Neutral')}>Neutral</li>
                                    <li onClick={() => handleStyleChange('Creative')}>Creative</li>
                                    <li onClick={() => handleStyleChange('Technical')}>Technical</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
                <div className='dropdown'>
                    <button className='dropdown-toggle' onClick={() => setIsToneDropdownOpen(!isToneDropdownOpen)}>
                        <b>Tone:</b> {tone}
                    </button>
                    {isToneDropdownOpen && (
                        <div className='dropdown-content'>
                            <div className='dropdown-section'>
                                <strong>Tone</strong>
                                <ul>
                                    <li onClick={() => handleToneChange('Formal')}>Formal</li>
                                    <li onClick={() => handleToneChange('Informal')}>Informal</li>
                                    <li onClick={() => handleToneChange('Diplomatic')}>Diplomatic</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
                <button className='submit-button' onClick={handleSend}>
                    <SendHorizontal className='button-icon' />
                </button>
            </div>
            <textarea
                className='text-input'
                placeholder='Enter your text here...'
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
        </div>
    );
};

export default FormatingText;