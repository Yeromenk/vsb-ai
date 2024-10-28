import {useState} from 'react';
import './formatingText.css';
import {SendHorizontal} from 'lucide-react';
import axios from "axios";

const FormatingText = () => {
    const [style, setStyle] = useState('Simple');
    const [tone, setTone] = useState('Formal');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [input, setInput] = useState('');

    const handleStyleChange = (newStyle) => {
        setStyle(newStyle);
        setIsDropdownOpen(false);
    };

    const handleToneChange = (newTone) => {
        setTone(newTone);
        setIsDropdownOpen(false);
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
    }

    return (
        <div className='formating-text-container'>
            <div className='text-options'>
                <div className='dropdown'>
                    <button className='dropdown-toggle' onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <b>Style:</b> {style} | <b>Tone:</b> {tone}
                    </button>
                    <button className='submit-button' onClick={handleSend}>
                        <SendHorizontal className='button-icon'/>
                    </button>
                    {isDropdownOpen && (
                        <div className='dropdown-content'>
                            <div className='dropdown-section'>
                                <strong>Style</strong>
                                <ul>
                                    <li onClick={() => handleStyleChange('Neutral')}>Neutral</li>
                                    <li onClick={() => handleStyleChange('Creative')}>Creative</li>
                                    <li onClick={() => handleStyleChange('Technical')}>Technical</li>
                                </ul>
                            </div>
                            <div className='dropdown-section'>
                                <strong>Tone</strong>
                                <ul>
                                    <li onClick={() => handleToneChange('Formal')}>Formal</li>
                                    <li onClick={() => handleToneChange('Informal')}>Informal</li>
                                    <li onClick={() => handleToneChange('Friendly')}>Friendly</li>
                                    <li onClick={() => handleToneChange('Diplomatic')}>Diplomatic</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <input type='text' className='text-input' placeholder='Enter your text here...' value={input}
                   onChange={(e) => {
                       setInput(e.target.value)
                   }}></input>
        </div>
    );
};

export default FormatingText;