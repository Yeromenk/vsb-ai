import React, { useState } from 'react';
import './translateText.css';
import { ChevronDown, ArrowRight } from 'lucide-react';
import axios from "axios";
import { useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const TranslateText = () => {
    const [sourceLanguage, setSourceLanguage] = useState('English');
    const [targetLanguage, setTargetLanguage] = useState('Spanish');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [input, setInput] = useState('');

    const { currentUser } = useContext(AuthContext);
    const userId = currentUser.id;
    const navigate = useNavigate();

    const handleLanguageChange = (newLanguage, type) => {
        if (type === 'source') {
            setSourceLanguage(newLanguage);
        } else {
            setTargetLanguage(newLanguage);
        }
        setIsDropdownOpen(false);
        setActiveDropdown(null);
    };

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (text) => {
            const response = await axios.post('http://localhost:3000/ai/chats', {
                message: text,
                sourceLanguage,
                targetLanguage,
                userId
            });
            return response.data.response;
        },
        onSuccess: (newChat) => {
            queryClient.invalidateQueries({ queryKey: ['ChatList'] });
            navigate(`/translate/chat/${newChat.id}`);
        },
        onError: (error) => {
            console.error("Error in handleSend:", error);
        }
    });

    const toggleDropdown = (type) => {
        setIsDropdownOpen((prev) => !prev);
        setActiveDropdown((prev) => (prev === type ? null : type));
    };

    const handleSend = async (event) => {
        event.preventDefault();
        if (input.trim() === '') return;

        mutation.mutate(input);

        setInput('');
    };

    return (
        <div className='translate-text'>
            <div className="translate-container">
                <div className='overview'>
                    <h1>Translate Text</h1>
                    <p>Here you can translate a text and get an overview</p>
                </div>
                <div className="container">
                    <div className="language-selection">
                        <div className="dropdown">
                            <button
                                className="dropbtn"
                                onClick={() => toggleDropdown('source')}
                            >
                                {sourceLanguage} <ChevronDown/>
                            </button>
                            {isDropdownOpen && activeDropdown === 'source' && (
                                <div className="dropdown-content">
                                    <ul>
                                        <li onClick={() => handleLanguageChange('English', 'source')}>English</li>
                                        <li onClick={() => handleLanguageChange('Spanish', 'source')}>Spanish</li>
                                        <li onClick={() => handleLanguageChange('Italian', 'source')}>Italian</li>
                                        <li onClick={() => handleLanguageChange('Russian', 'source')}>Russian</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                        <ArrowRight className="arrow-icon"/>
                        <div className="dropdown">
                            <button
                                className="dropbtn"
                                onClick={() => toggleDropdown('target')}
                            >
                                {targetLanguage} <ChevronDown/>
                            </button>
                            {isDropdownOpen && activeDropdown === 'target' && (
                                <div className="dropdown-content">
                                    <ul>
                                        <li onClick={() => handleLanguageChange('English', 'target')}>English</li>
                                        <li onClick={() => handleLanguageChange('Spanish', 'target')}>Spanish</li>
                                        <li onClick={() => handleLanguageChange('Italian', 'target')}>Italian</li>
                                        <li onClick={() => handleLanguageChange('Russian', 'target')}>Russian</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                        <button className="submit-btn" onClick={handleSend}>
                            Translate <ArrowRight/>
                        </button>
                    </div>

                    <textarea
                        className='text-input'
                        placeholder='Enter text to translate'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    ></textarea>

                </div>
            </div>
        </div>
    );
};

export default TranslateText;