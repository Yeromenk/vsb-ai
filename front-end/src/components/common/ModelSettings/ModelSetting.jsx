import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Sliders, InfoIcon, Save } from 'lucide-react';
import './ModelSettings.css';

const ModelSettings = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await axios.get('http://localhost:3000/ai/models', {
          withCredentials: true,
        });
        setModels(res.data.models);
        if (res.data.models.length > 0) {
          setSelectedModel(res.data.models[0].id);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        toast.error('Failed to load AI models');
      }
    };

    fetchModels();
  }, []);

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await axios.post(
        'http://localhost:3000/ai/models/preferences',
        { modelId: selectedModel, temperature, maxTokens },
        { withCredentials: true }
      );
      toast.success('AI settings saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch models
        const modelsRes = await axios.get('http://localhost:3000/ai/models', {
          withCredentials: true,
        });
        setModels(modelsRes.data.models);

        // Fetch user preferences
        const prefsRes = await axios.get('http://localhost:3000/ai/models/preferences', {
          withCredentials: true,
        });

        if (prefsRes.data.preferences) {
          const prefs = prefsRes.data.preferences;
          setSelectedModel(prefs.modelId);
          setTemperature(prefs.temperature);
          setMaxTokens(prefs.maxTokens);
        } else if (modelsRes.data.models.length > 0) {
          setSelectedModel(modelsRes.data.models[0].id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load settings');
      }
    };

    fetchData();
  }, []);

  return (
    <div className="model-settings-container">
      <div className="settings-header">
        <h3>
          <Sliders size={18} className="field-icon" />
          AI Model Settings
        </h3>
      </div>

      <div className="info-item">
        <div className="info-content">
          <div className="setting-group">
            <label>Select Model</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="model-select"
            >
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="setting-sliders">
        <div className="slider-group">
          <label>
            Temperature: {temperature}
            <span
              className="tooltip-icon"
              title="Controls creativity. Lower values = more predictable responses"
            >
              <InfoIcon size={14} />
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={e => setTemperature(parseFloat(e.target.value))}
            className="slider-input"
          />
          <div className="range-labels">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        <div className="slider-group">
          <label>
            Max tokens: {maxTokens}
            <span className="tooltip-icon" title="Maximum length of the response">
              <InfoIcon size={14} />
            </span>
          </label>
          <input
            type="range"
            min="100"
            max="1000"
            step="50"
            value={maxTokens}
            onChange={e => setMaxTokens(parseInt(e.target.value))}
            className="slider-input"
          />
          <div className="range-labels">
            <span>Concise</span>
            <span>Detailed</span>
          </div>
        </div>
      </div>

      <button className="submit-button" onClick={handleSavePreferences} disabled={loading}>
        <Save size={16} />
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

export default ModelSettings;
