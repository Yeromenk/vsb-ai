// Fix for front-end/src/pages/email/Email.jsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Email.css';
import EmailAssistant from '../../components/email-assistant/EmailAssistant';

const Email = ({ data, setPendingMessage, setIsAiLoading, inputRef }) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: formData => {
      return axios.put(
        `http://localhost:3000/ai/email/chat/${data.id}`,
        { prompt: formData.message },
        { withCredentials: true }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat', data.id]).then(() => {
        setPendingMessage(null);
        setIsAiLoading(false);
      });
    },
    onError: error => {
      console.error('error in handleSend:', error);
      toast.error('Error updating chat history');
      setPendingMessage(null);
      setIsAiLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleSubmit = formData => {
    setPendingMessage(formData.message);
    setIsAiLoading(true);
    setLoading(true);
    mutation.mutate(formData);
  };

  return (
    <div className="email-page-container" ref={inputRef}>
      <EmailAssistant onSubmit={handleSubmit} loading={loading} data={data} />
    </div>
  );
};

export default Email;
