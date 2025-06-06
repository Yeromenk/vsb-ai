import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import FormatControls from '../../components/format-controls/FormatControls';
import './Format.css';

const Format = ({ data, setPendingMessage, setIsAiLoading, inputRef }) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: formData => {
      return axios.put(`http://localhost:3000/ai/format/chat/${data.id}`, formData, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat', data.id]).then(() => {
        setPendingMessage(null);
        setIsAiLoading(false);
      });
    },
    onError: error => {
      console.error('error in handleSend:', error);
      toast.error('error updating chat history');
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
    <div className="format-page-container" ref={inputRef}>
      <FormatControls
        onSubmit={handleSubmit}
        loading={loading}
        initialStyle={data?.style || 'Simple'}
        initialTone={data?.tone || 'Formal'}
      />
    </div>
  );
};

export default Format;
