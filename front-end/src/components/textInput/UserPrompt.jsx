import { useState } from 'react';
import { SendHorizontal} from 'lucide-react';
import './UserPrompt.css';

const UserPrompt = () => {
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
        <div className="user-prompt-container">
            <div className="user-prompt">
                <h1>Some text</h1>
            </div>
            <div className="document-input-prompt">
                <form>
                    <div className="input-container">
                        <textarea
                            rows={1}
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="What do you want to ask?"
                        />
                        <button type="submit">
                            <SendHorizontal className="send-button" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserPrompt;
