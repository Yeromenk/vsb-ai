import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import FileProcessing from '../../components/file-processing/FileProcessing';
import './Summarize.css';

const Summarize = ({ data, setPendingMessage, setIsAiLoading, inputRef }) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ file, action }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', action);
      return axios.put(`http://localhost:3000/ai/file/chat/${data.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
      console.error('error processing file:', error);
      toast.error('error processing file. Please try again.');
      setPendingMessage(null);
      setIsAiLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleSubmit = async ({ file, action }) => {
    if (!file || !action || loading) return;

    setPendingMessage(`Processing file: ${file.name} (${action})`);
    setIsAiLoading(true);
    setLoading(true);

    try {
      // First, upload the file info
      await axios.post('http://localhost:3000/ai/file', {
        file: file.name,
        action: action,
      });

      // Then update the chat with the file analysis
      mutation.mutate({ file, action });
    } catch (error) {
      console.error('error processing file:', error);
      toast.error('error processing file. Please try again.');
      setPendingMessage(null);
      setIsAiLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="summarize-page">
      <div ref={inputRef}>
        <FileProcessing
          onSubmit={handleSubmit}
          loading={loading}
          buttonText="Process File"
          isUpdate={true}
        />
      </div>
    </div>
  );
};

export default Summarize;
