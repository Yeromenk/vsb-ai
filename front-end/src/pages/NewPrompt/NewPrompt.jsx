import React from 'react';
import './NewPrompt.css';
import { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CircleX } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const NewPrompt = () => {
  const [instructions, setInstructions] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const createChatMutation = useMutation({
    mutationFn: async chatData => {
      const response = await axios.post('http://localhost:3000/ai/chats/new-prompt', chatData, {
        withCredentials: true,
      });
      return response.data.response;
    },
    onSuccess: data => {
      toast.success('Custom chat created successfully');
      queryClient.invalidateQueries(['ChatList']);
      navigate(`/chat/${data.id}`);
    },
    onError: err => {
      setError('Failed to create custom chat: ' + (err.response?.data?.error || err.message));
      console.error(err);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleCreateChat = async () => {
    if (!instructions || !description || !name) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const chatData = {
      name,
      description,
      instructions,
    };

    createChatMutation.mutate(chatData);
  };

  return (
    <div className="new-prompt">
      <div className="container-new-prompt">
        <h1>Configure your own chat</h1>
        <p>
          Here you can create a custom chat with specific instructions for how the AI should
          respond.
        </p>
        <div className="form-prompt">
          <h3>Name</h3>
          <input
            type="text"
            placeholder="Give your chat a name"
            className="text"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <h3>Description</h3>
          <input
            type="text"
            placeholder="Write a description for what the chat is about"
            className="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <h3>Instructions</h3>
          <textarea
            placeholder="Provide detailed instructions for how the AI should respond (e.g., 'Respond as a professional email assistant' or 'Help me write poetry in a specific style')"
            className="instructions"
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
          />
          {error && (
            <div className="error-banner">
              <CircleX />
              {error}
            </div>
          )}
          <button onClick={handleCreateChat} disabled={loading}>
            {loading ? 'Creating...' : 'Create Custom Chat'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPrompt;
