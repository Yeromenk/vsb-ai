import {useContext, useState} from 'react';
import './formatingText.css';
import {SendHorizontal} from 'lucide-react';
import axios from 'axios';
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {AuthContext} from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";

const FormatingText = () => {
    const [style, setStyle] = useState('Simple');
    const [tone, setTone] = useState('Formal');
    const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
    const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
    const [input, setInput] = useState('');

    const navigate = useNavigate();
    const {currentUser} = useContext(AuthContext);
    const userId = currentUser.id;

    const handleStyleChange = (newStyle) => {
        setStyle(newStyle);
        setIsStyleDropdownOpen(false);
    };

    const handleToneChange = (newTone) => {
        setTone(newTone);
        setIsToneDropdownOpen(false);
    };

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (text) => {
            const response = await axios.post('http://localhost:3000/ai/chats', {
                message: text,
                style,
                tone,
                userId
            });
            return response.data.response;
        },
        onSuccess: (newChat) => {
            queryClient.invalidateQueries({queryKey: ['ChatList']});
            navigate(`/format/chat/${newChat.id}`);
        },
        onError: (error) => {
            console.error("Error in handleSend:", error);
        }
    })

    const handleSend = async (event) => {
        event.preventDefault();
        if (input.trim() === '') return;

        mutation.mutate(input);

        setInput('');
    };

    return (
        <div className='formating-text-container'>
            <div className="formating-text">
                <div className='hello'>
                    <h1>Format a text</h1>
                    <p>Here you can format a text and get an overview</p>
                </div>

                <div className='text-options'>
                    <div className='text-options-row'>
                        <div className='dropdown'>
                            <button className='dropdown-toggle'
                                    onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}>
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
                           Format <SendHorizontal className='button-icon'/>
                        </button>
                    </div>
                    <textarea
                        className='text-input'
                        placeholder='Enter your text here...'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>

            </div>
        </div>
    );
};

export default FormatingText;