import React, { useContext, useState } from 'react';
import { FilePlus2, FileText, Send } from 'lucide-react';
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
  };

  return (
    <div className="file-page">
      <div className="file-page__container">
        <div className="file-page__header">
          <h1 className="file-page__title">Analyze Documents</h1>
          <p className="file-page__subtitle">
            Upload a file to summarize or analyze its content with AI
          </p>
          <p className="file-page__subtitle-formats">
            Supported formats: <strong>.docx</strong>
          </p>
        </div>

        <div className="file-uploader">
          <form className="file-uploader__form" onSubmit={handleSubmit}>
            <div className="file-uploader__input-wrapper">
              <label className="file-uploader__dropzone">
                <FilePlus2 className="file-uploader__icon" />
                <span className="file-uploader__text">
                  {file ? file.name : 'Click to upload a document'}
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  hidden
                  accept=".pdf,.docx,.txt"
                />
              </label>
            </div>

            <div className="file-uploader__actions">
              <button
                type="button"
                className={`file-uploader__action-btn ${action === 'summarize' ? 'file-uploader__action-btn--active' : ''}`}
                onClick={() => handleActionChange('summarize')}
              >
                <FileText size={18} />
                Summarize
              </button>
              <button
                type="button"
                className={`file-uploader__action-btn ${action === 'describe' ? 'file-uploader__action-btn--active' : ''}`}
                onClick={() => handleActionChange('describe')}
              >
                <FileText size={18} />
                Analyze
              </button>
            </div>

            <button
              type="submit"
              className="file-uploader__submit"
              disabled={!file || !action || mutation.isPending}
            >
              <Send className="file-uploader__button-icon" />
              {mutation.isPending ? "Processing..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;