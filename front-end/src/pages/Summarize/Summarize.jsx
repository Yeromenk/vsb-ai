import './Summarize.css';
import { FilePlus2, Send } from 'lucide-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext';

const Summarize = ({ data }) => {
  const [file, setFile] = useState(null);
  const [action, setAction] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const firstLetter = currentUser?.username.charAt(0).toUpperCase();
  const endRef = useRef();

  useEffect(() => {
    if (endRef.current) {
      setTimeout(() => {
        endRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [data, response]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', action);
      const { data: result } = await axios.put(
        `http://localhost:3000/ai/file/chat/${data.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );
      return result.response;
    },
    onSuccess: result => {
      queryClient.invalidateQueries({ queryKey: ['chat', data.id] }).then(() => {
        setResponse(result);
        setFile(null);
        setAction('');
        setError(null);
        setLoading(false);
      });
    },
    onError: error => {
      setError(error);
      setLoading(false);
      console.error('Error in handleSend:', error);
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
    if (!file || !action) return;

    mutation.mutate();
    console.log(`File: ${file.name}, Action: ${action}`);
  };

  return (
    <div className="summarize-page">
      <div className="chat">
        {data?.messages?.map((msg, index) => (
          <div className="message-container" key={index}>
            {msg.role === "assistant" ? (
              <>
                <div className="avatar model-avatar">
                  <img src="/vsb-logo.jpg" alt="vsb-logo" />
                </div>
                <div className="message model-message">{msg.content}</div>
              </>
            ) : (
              <>
                <div className="message user-message">{msg.content}</div>
                <div className="avatar user-avatar">{firstLetter}</div>
              </>
            )}
          </div>
        ))}

        {loading && (
          <div className="message-container">
            <div className="avatar model-avatar">
              <img src="/vsb-logo.jpg" alt="vsb-logo" />
            </div>
            <div className="message model-message">
              <Skeleton width="10rem" />
            </div>
          </div>
        )}

        {response && !data?.messages?.some(msg => msg.content === response) && (
          <div className="message-container">
            <div className="avatar model-avatar">
              <img src="/vsb-logo.jpg" alt="vsb-logo" />
            </div>
            <div className="message model-message">{response}</div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="document-input">
        <div className="document-input-container">
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
              <button type="submit" disabled={!file || !action || loading}>
                <Send className="button-icon" /> Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summarize;