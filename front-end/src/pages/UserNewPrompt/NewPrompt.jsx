import React from 'react';
import './NewPrompt.css';
import { useState } from 'react';

// TODO - Implement the getNewPrompt function
const NewPrompt = () => {
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreateChat = async () => {
        if (!instructions) {
            setError('Instructions cannot be empty.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // const aiResponse = await getNewPrompt(instructions);
            // setResponse(aiResponse); // Сохранение ответа ИИ
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
                        placeholder="Name"
                        className='text'
                    />

                    <h3>Description</h3>
                    <input
                        type="text"
                        placeholder="Description"
                        className='text'
                    />

                    <h3>Instructions</h3>
                    <textarea
                        placeholder="Instructions"
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