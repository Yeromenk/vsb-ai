import React from 'react';
import './NewPrompt.css';
import {useState} from 'react';
import axios from 'axios';
import {toast} from "react-hot-toast";
import {useNavigate} from "react-router-dom";

// TODO - Implement the getNewPrompt function
const NewPrompt = () => {
    const [instructions, setInstructions] = useState('');
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleCreateChat = async () => {
        if (!instructions || !description || !name) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:3000/ai/chats/prompt', {
                name,
                description,
                instructions
            })

            toast.success('Chat created successfully');
            navigate(`/chat/${response.data.response.id}`);
            console.log(response);
        } catch (err) {
            setError('Failed to generate chat. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='new-prompt'>
            <div className="container-new-prompt">
                <h1>Configure your own chat</h1>
                <p>Here you can configure your own chat. You just need to write a name, description and a
                    instructions</p>
                <div className="form-prompt">

                    <h3>Name</h3>
                    <input
                        type="text"
                        placeholder="Give a chat name"
                        className='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <h3>Description</h3>
                    <input
                        type="text"
                        placeholder="Write a description for what the chat is about"
                        className='text'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <h3>Instructions</h3>
                    <textarea
                        placeholder="What this chat do? "
                        className='instructions'
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                    {error && <p className='error'>{error}</p>}
                    <button onClick={handleCreateChat} disabled={loading}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default NewPrompt;