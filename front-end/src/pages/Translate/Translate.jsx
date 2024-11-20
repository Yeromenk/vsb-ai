import React, {useContext, useEffect, useRef, useState} from 'react';
import './Translate.css';
import {ChevronDown, ArrowRight} from 'lucide-react';
import axios from "axios";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {AuthContext} from "../../context/AuthContext";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

const Translate = ({data}) => {
    const [sourceLanguage, setSourceLanguage] = useState('English');
    const [targetLanguage, setTargetLanguage] = useState('Spanish');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState("");
    const [response, setResponse] = useState("");
    const endRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const {currentUser} = useContext(AuthContext);
    const firstLetter = currentUser?.username.charAt(0).toUpperCase();

    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [data, messages, response]);

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
        mutationFn: () => {
            return axios.put(`http://localhost:3000/ai/translate/chat/${data.id}`, {
                message: messages.length ? messages : undefined,
                sourceLanguage,
                targetLanguage,
            }, {
                withCredentials: true,
            }).then((res) => res.data.response);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['chat', data.id]}).then(() => {
                setMessages("");
                setResponse("");
                setInput('');
            });
        },
        onError: (error) => {
            console.error("Error in handleSend:", error);
        }
    });

    const toggleDropdown = (type) => {
        setIsDropdownOpen((prev) => !prev);
        setActiveDropdown((prev) => (prev === type ? null : type));
    };

    const add = async (text, isInitial) => {
        if (text.trim() === '') return;

        setLoading(true)
        if (!isInitial) setMessages(text)

        try {
            const translationResponse = await axios.post('http://localhost:3000/ai/translate', {
                message: text,
                sourceLanguage,
                targetLanguage,
            });

            const translatedText = translationResponse.data.translatedText;

            setResponse(translatedText);
            setLoading(false)
            mutation.mutate();
        } catch (error) {
            console.error("Error in handleSend:", error);
            setLoading(false)
        } finally {
            setLoading(false)
        }
    };

    const handleSend = async (event) => {
        event.preventDefault();
        if (!loading) {
            await add(input, false);
        }
    };

    return (
        <>
            <div className="chat">
                {messages && (<div className="message-container">
                    <div className="message user-message">{messages}</div>
                    <div className='avatar user-avatar'>
                        {firstLetter}
                    </div>
                </div>)}
                {loading ? (
                    <div className="message-container">
                        <div className='avatar model-avatar'>
                            <img src='/vsb-logo.jpg' alt='vsb-logo'/>
                        </div>
                        <div className="message model-message"><Skeleton width="10rem"/></div>
                    </div>
                ) : (
                    response && (
                        <div className="message-container">
                            <div className='avatar model-avatar'>
                                <img src='/vsb-logo.jpg' alt='vsb-logo'/>
                            </div>
                            <div className="message model-message">{response}</div>
                        </div>
                    ))}
                <div ref={endRef}/>
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
        </>
    );
};

export default Translate;