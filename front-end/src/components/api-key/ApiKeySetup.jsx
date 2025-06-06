import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Key, Eye, EyeOff, RefreshCw, Save } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './ApiKeySetup.css';

const ApiKeySetup = ({ existingApiKey, onUpdate }) => {
  const [apiKey, setApiKey] = useState(existingApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshUser } = useContext(AuthContext);

  const handleApiKeyChange = e => {
    setApiKey(e.target.value);
    if (apiKeyError) setApiKeyError('');
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(prev => !prev);
  };

  const validateApiKey = () => {
    if (!apiKey.trim()) {
      setApiKeyError('API Key is required to use AI features');
      return false;
    }

    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      setApiKeyError('Please enter a valid OpenAI API key (starts with sk-)');
      return false;
    }

    return true;
  };

  const saveApiKey = async () => {
    if (!validateApiKey()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:3000/ai/api-key', { apiKey }, { withCredentials: true });

      toast.success('API key saved successfully');
      refreshUser();
      if (onUpdate) onUpdate(apiKey);
    } catch (error) {
      console.error('error saving API key:', error);
      setApiKeyError(error.response?.data?.message || 'Failed to save API key');
      toast.error('Failed to save API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="api-key-section">
      <h3>OpenAI API Key</h3>
      <p className="key-instructions">
        Your OpenAI API key is required to use AI features. Get your API key from{' '}
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
          OpenAI Dashboard
        </a>
      </p>

      <div className="api-key-edit">
        <div className="input-container">
          <Key size={20} className="icon-api" />
          <input
            type={showApiKey ? 'text' : 'password'}
            placeholder="Enter your OpenAI API key"
            value={apiKey}
            onChange={handleApiKeyChange}
          />
          <div className="toggle-visibility" onClick={toggleApiKeyVisibility}>
            {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        </div>

        {apiKeyError && <div className="error-message-api">{apiKeyError}</div>}

        <div className="api-key-actions">
          <button className="submit-button" onClick={saveApiKey} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="icon-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save API Key
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySetup;
