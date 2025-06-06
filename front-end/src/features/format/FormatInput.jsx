import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import FormatControls from '../../components/format-controls/FormatControls';
import './FormatInput.css';
import { toast } from 'react-hot-toast';

const FormatInput = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser.id;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async formData => {
      const response = await axios.post('http://localhost:3000/ai/chats', {
        message: formData.message,
        style: formData.style,
        tone: formData.tone,
        userId,
      });
      return response.data.response;
    },
    onSuccess: newChat => {
      queryClient.invalidateQueries({ queryKey: ['ChatList'] });
      navigate(`/format/chat/${newChat.id}`);
    },
    onError: error => {
      console.error('error in handleSend:', error);
      toast.error('Failed to format text. Please try again.');
    },
  });

  return (
    <div className="format-page">
      <div className="format-container">
        <div className="format-header">
          <h1 className="format-header__title">Format a text</h1>
          <p className="format-header__subtitle">Improve your writing with AI-powered formatting</p>
        </div>

        <FormatControls onSubmit={mutation.mutate} loading={mutation.isPending} />
      </div>
    </div>
  );
};

export default FormatInput;
