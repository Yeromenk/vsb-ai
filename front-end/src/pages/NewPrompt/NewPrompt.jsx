import React, { useState } from 'react';
import './NewPrompt.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CircleX, Settings, Info, Pencil, MessageSquarePlus, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const NewPrompt = () => {
  const [instructions, setInstructions] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createChatMutation = useMutation({
    mutationFn: async chatData => {
      const response = await axios.post('http://localhost:3000/ai/chats/custom-template', chatData, {
        withCredentials: true,
      });
      return response.data.response;
    },
    onSuccess: data => {
      toast.success('Custom chat template created successfully');
      queryClient.invalidateQueries(['ChatList']);
      navigate(`/template/${data.id}`);
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
        <div className="prompt-header">
          <MessageSquarePlus size={28} className="header-icon" />
          <h1>Configure your own chat</h1>
        </div>
        <p className="prompt-description">
          <Info size={18} className="info-icon" />
          Create a custom chat with specific instructions for how the AI should respond to your needs.
        </p>
        <div className="form-prompt">
          <div className="input-group">
            <h3>
              <Pencil size={18} className="field-icon" /> Name
            </h3>
            <input
              type="text"
              placeholder="Give your chat a name"
              className="text"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <h3>
              <Info size={18} className="field-icon" /> Description
            </h3>
            <input
              type="text"
              placeholder="Write a description for what the chat is about"
              className="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="input-group">
            <h3>
              <Settings size={18} className="field-icon" /> Instructions
            </h3>
            <textarea
              placeholder="Provide detailed instructions for how the AI should respond (e.g., 'Respond as a professional email assistant' or 'Help me write poetry in a specific style')"
              className="instructions"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
          </div>

          {error && (
            <div className="error-banner">
              <CircleX size={18} />
              {error}
            </div>
          )}

          <button onClick={handleCreateChat} disabled={loading} className="create-button">
            {loading ? 'Creating...' : (
              <>
                <Save size={20} />
                <span>Create Custom Chat</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPrompt;