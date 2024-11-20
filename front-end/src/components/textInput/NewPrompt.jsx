import { useState } from 'react';
import { SendHorizontal, FilePlus2 } from 'lucide-react';
import './NewPrompt.css';

const NewPrompt = () => {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (e) => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.overflowY = 'hidden';
        textarea.style.height = `${textarea.scrollHeight}px`;

        if (textarea.scrollHeight > 128) {
            textarea.style.overflowY = 'auto';
            textarea.style.height = '128px';
        }

        setInputValue(textarea.value);
    };

    return (
        <div className='document-input'>
            <form >
                <div className='input-container'>
                    <FilePlus2 className='input-icon' />
                    <textarea
                        rows={1}
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder='What do you want to ask?' />
                    <button type='submit'>
                        <SendHorizontal className='send-button' />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewPrompt;
