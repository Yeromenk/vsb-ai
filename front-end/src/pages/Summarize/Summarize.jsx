import { FilePlus2, FileText, Send } from 'lucide-react';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Summarize.css';

const Summarize = ({ data, setPendingMessage, setIsAiLoading }) => {
  const [file, setFile] = useState(null);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', action);
      return axios.put(
        `http://localhost:3000/ai/file/chat/${data.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat', data.id])
                 .then(() => {
                   setPendingMessage(null);
                   setIsAiLoading(false);
                   setFile(null);
                   setAction('');
                 });
    },
    onError: error => {
      console.error('Error processing file:', error);
      toast.error('Error processing file. Please try again.');
      setPendingMessage(null);
      setIsAiLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleActionChange = newAction => {
    setAction(newAction);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file || !action || loading) return;

    // Show pending message immediately
    setPendingMessage(`Processing file: ${file.name} (${action})`);
    // Show AI is thinking
    setIsAiLoading(true);
    setLoading(true);

    // Process file
    try {
      // First analyze the file
      const fileData = new FormData();
      fileData.append('file', file);
      fileData.append('action', action);

      await axios.post('http://localhost:3000/ai/file', {
        file: file.name,
        action: action
      });

      // Then update the chat with the file analysis
      mutation.mutate();
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing file. Please try again.');
      setPendingMessage(null);
      setIsAiLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="summarize-page">
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
                accept=".pdf,.doc,.docx,.txt,.rtf"
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
  );
};

export default Summarize;