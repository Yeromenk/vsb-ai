import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Sliders, InfoIcon, Save, RefreshCw, ChevronDown } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './ModelSettings.css';

const ModelSettings = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedModelName, setSelectedModelName] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(true);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setFetchingModels(true);
      try {
        const modelsRes = await axios.get('http://localhost:3000/ai/models', {
          withCredentials: true,
        });
        setModels(modelsRes.data.models);

        const prefsRes = await axios.get('http://localhost:3000/ai/models/preferences', {
          withCredentials: true,
        });

        if (prefsRes.data.preferences) {
          const prefs = prefsRes.data.preferences;
          setSelectedModel(prefs.modelId);

          // Set selected model name
          const selectedModelObj = modelsRes.data.models.find(m => m.id === prefs.modelId);
          if (selectedModelObj) {
            setSelectedModelName(selectedModelObj.name);
          }

          setTemperature(prefs.temperature);
          setMaxTokens(prefs.maxTokens);
        } else if (modelsRes.data.models.length > 0) {
          setSelectedModel(modelsRes.data.models[0].id);
        }
      } catch (error) {
        console.error('error fetching data:', error);
        toast.error('Failed to load settings');
      } finally {
        setFetchingModels(false);
      }
    };

    fetchData();
  }, []);

  const handleModelChange = (modelId, modelName) => {
    setSelectedModel(modelId);
    setSelectedModelName(modelName);
    setIsModelDropdownOpen(false);
  };

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
      console.error('error saving preferences:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const closeDropdowns = e => {
    if (!e.target.closest('.format-dropdown')) {
      setIsModelDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  return (
    <div className="model-settings-container">
      <div className="settings-header">
        <h3>
          <Sliders size={18} className="field-icon" />
          AI Model Settings
        </h3>
      </div>

      {fetchingModels ? (
        <div className="model-settings-skeleton">
          <div className="setting-group">
            <label>
              <Skeleton width={100} />
            </label>
            <Skeleton height={38} className="model-select-skeleton" />
          </div>

          <div className="slider-group">
            <label>
              <Skeleton width={150} />
            </label>
            <Skeleton height={20} />
            <div className="range-labels">
              <Skeleton width={50} />
              <Skeleton width={50} />
            </div>
          </div>

          <div className="slider-group">
            <label>
              <Skeleton width={150} />
            </label>
            <Skeleton height={20} />
            <div className="range-labels">
              <Skeleton width={50} />
              <Skeleton width={50} />
            </div>
          </div>

          <Skeleton height={40} width={120} className="button-skeleton" />
        </div>
      ) : (
        <>
          <div className="info-item">
            <div className="info-content">
              <div className="setting-group">
                <label>Select Model</label>
                <div className="format-dropdown model-dropdown">
                  <button
                    className="dropdown-button"
                    onClick={e => {
                      e.stopPropagation();
                      setIsModelDropdownOpen(!isModelDropdownOpen);
                    }}
                  >
                    {selectedModelName || 'Select a model'} <ChevronDown size={16} />
                  </button>
                  {isModelDropdownOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-section">
                        <div className="dropdown-section-header">Available Models</div>
                        <ul className="dropdown-option-list">
                          {models.map(model => (
                            <li
                              key={model.id}
                              className="dropdown-option"
                              onClick={() => handleModelChange(model.id, model.name)}
                            >
                              {model.name} - {model.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
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
            {loading ? (
              <>
                <RefreshCw size={16} className="icon-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default ModelSettings;
