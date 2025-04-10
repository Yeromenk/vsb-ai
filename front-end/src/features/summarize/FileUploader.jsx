import React, { useContext, useState } from 'react';
import { FilePlus2, Send } from 'lucide-react';
import './FileUploader.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [action, setAction] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser.id;

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
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

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleActionChange = newAction => {
    setAction(newAction);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!file || !action) return;

    mutation.mutate();

    console.log(`File: ${file.name}, Action: ${action}`);
  };

  return (
    <div className="document-input">
      <div className="document-input-container">
        <div className="hello">
          <h1>Summarize a file</h1>
          <p>Here you can summarize a file and get an overview</p>
        </div>
        <div className="file-container">
          <form onSubmit={handleSubmit}>
            <div className="file-input-container">
              <label className="file-label">
                <FilePlus2 className="file-icon" />
                <span>{file ? file.name : 'Choose a file'}</span>
                <input type="file" onChange={handleFileChange} hidden />
              </label>
            </div>
            <div className="action-buttons">
              <button
                type="button"
                className={action === 'summarize' ? 'active' : ''}
                onClick={() => handleActionChange('summarize')}
              >
                Summarize
              </button>
              <button
                type="button"
                className={action === 'describe' ? 'active' : ''}
                onClick={() => handleActionChange('describe')}
              >
                Describe
              </button>
            </div>
            <button type="submit" disabled={!file || !action}>
              <Send className="button-icon" /> Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
