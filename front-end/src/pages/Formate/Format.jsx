import './Format.css'
import {SendHorizontal} from "lucide-react";
import {useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import axios from "axios";

const Format = ({data}) => {
    const [style, setStyle] = useState('Simple');
    const [tone, setTone] = useState('Formal');
    const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
    const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState("");
    const [response, setResponse] = useState("");

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
        mutationFn: () => {
            return axios.put(`http://localhost:3000/ai/format/chat/${data.id}`, {
                message: messages.length ? messages : undefined,
                style,
                tone,
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
    })

    const add = async (text, isInitial) => {
        if (text.trim() === '') return;

        if (!isInitial) setMessages(text)

        try {
            const formatResponse = await axios.post('http://localhost:3000/ai/format', {
                message: text,
                style,
                tone
            });

            const formattedText = formatResponse.data.formattedText;
            setResponse(formattedText);

            mutation.mutate();
        } catch (error) {
            console.error("Error in handleSend:", error);
        }
    }

    const handleSend = async (event) => {
        event.preventDefault();
        await add(input, false);
    };

    return (
        <div className='formating-text-container'>
            <div className="formating-text">
                {messages && <div>{messages}</div>}
                {response && <div>{response}</div>}
                <div className='text-options'>
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
                        <SendHorizontal className='button-icon'/>
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
    );
};

export default Format;