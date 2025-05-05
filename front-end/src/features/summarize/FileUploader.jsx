import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import FileProcessing from '../../components/common/FileProcessing/FileProcessing';
import './FileUploader.css';

const FileUploader = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser.id;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ file, action }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', action);
      formData.append('userId', userId);

      const response = await axios.post('http://localhost:3000/ai/chats', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.response;
    },
    onSuccess: newChat => {
      queryClient.invalidateQueries({ queryKey: ['ChatList'] });
      navigate(`/file/chat/${newChat.id}`);
    },
    onError: error => {
      console.error('Error in handleSend:', error);
    },
  });

  return (
    <div className="file-page">
      <div className="file-page__container">
        <div className="file-page__header">
          <h1 className="file-page__title">Analyze Documents</h1>
          <p className="file-page__subtitle">
            Upload a file to summarize or analyze its content with AI
          </p>
          <p className="file-page__subtitle-formats">Supported formats: .docx</p>
        </div>

        {/* Remove the extra div with the file-uploader class */}
        <FileProcessing onSubmit={mutation.mutate} loading={mutation.isPending} />
      </div>
    </div>
  );
};

export default FileUploader;
