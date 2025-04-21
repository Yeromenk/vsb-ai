import React, { useState } from 'react';
import { FilePlus2, FileText, Send } from 'lucide-react';

const FileProcessing = ({
                          onSubmit,
                          loading = false,
                        }) => {
  const [file, setFile] = useState(null);
  const [action, setAction] = useState('');

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleActionChange = newAction => {
    setAction(newAction);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!file || !action || loading) return;

    onSubmit({ file, action });
    
      setFile(null);
      setAction('');

  };

  return (
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
              name="file"
            />
          </label>
        </div>

        <div className="file-uploader__actions">
          <button
            type="button"
            className={`file-uploader__action-btn ${action === 'summarize' ? 'file-uploader__action-btn--active' : ''}`}
            onClick={() => handleActionChange('summarize')}
            name="action"
            value="summarize"
          >
            <FileText size={18} />
            Summarize
          </button>
          <button
            type="button"
            className={`file-uploader__action-btn ${action === 'describe' ? 'file-uploader__action-btn--active' : ''}`}
            onClick={() => handleActionChange('describe')}
            name="action"
            value="describe"
          >
            <FileText size={18} />
            Analyze
          </button>
        </div>

        <button
          type="submit"
          className="file-uploader__submit"
          disabled={!file || !action || loading}
        >
          <Send className="file-uploader__button-icon" />
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default FileProcessing;