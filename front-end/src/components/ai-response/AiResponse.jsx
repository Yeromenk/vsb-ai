import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Copy, CheckCircle, Mail, Edit, X, Save } from 'lucide-react';
import EmailModal from '../common/EmailModal/EmailModal';
import 'highlight.js/styles/github.css';
import './AiResponse.css';

const AiResponse = ({ text, onEdit, showEditButton = false, showEmailButton = false }) => {
  const [copied, setCopied] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    setEditedText(text);
  }, [text]);

  const handleCopy = () => {
    setIsCopying(true);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      })
      .finally(() => {
        setIsCopying(false);
      });
  };

  const startEditing = () => {
    setEditedText(text);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedText(text);
  };

  const saveEdit = () => {
    if (editedText !== text) {
      onEdit && onEdit(editedText);
    }
    setIsEditing(false);
  };

  return (
    <div className={`ai-response-container ${isEditing ? 'editing' : ''}`}>
      <div className="ai-response-actions">
        <button
          className="ai-action-button copy-button"
          onClick={handleCopy}
          aria-label="Copy text"
          disabled={isCopying}
        >
          {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          <span className="tooltip-text">{copied ? 'Copied!' : 'Copy text'}</span>
        </button>

        {showEditButton && !isEditing && (
          <button
            className="ai-action-button edit-button"
            onClick={startEditing}
            aria-label="Edit text"
          >
            <Edit size={16} />
            <span className="tooltip-text">Edit response</span>
          </button>
        )}

        {isEditing && (
          <>
            <button
              className="ai-action-button save-button"
              onClick={saveEdit}
              aria-label="Save changes"
            >
              <Save size={16} />
              <span className="tooltip-text">Save changes</span>
            </button>
            <button
              className="ai-action-button cancel-button"
              onClick={cancelEditing}
              aria-label="Cancel editing"
            >
              <X size={16} />
              <span className="tooltip-text">Cancel</span>
            </button>
          </>
        )}

        {showEmailButton && !isEditing && (
          <button
            className="ai-action-button email-button"
            onClick={() => setShowEmailModal(true)}
            aria-label="Send as email"
          >
            <Mail size={16} />
            <span className="tooltip-text">Send as email</span>
          </button>
        )}
      </div>

      <div className="ai-response">
        {isEditing ? (
          <div className="ai-response-editor">
            <textarea
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              className="ai-edit-textarea"
              autoFocus
            />
          </div>
        ) : (
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => <div {...props} />,
              h1: ({ node, ...props }) => <h1 className="ai-heading ai-h1" {...props} />,
              h2: ({ node, ...props }) => <h2 className="ai-heading ai-h2" {...props} />,
              h3: ({ node, ...props }) => <h3 className="ai-heading ai-h3" {...props} />,
              ul: ({ node, ...props }) => <ul className="ai-list" {...props} />,
              ol: ({ node, ...props }) => <ol className="ai-ordered-list" {...props} />,
              li: ({ node, ...props }) => <li className="ai-list-item" {...props} />,
              a: ({ node, ...props }) => (
                <a className="ai-link" target="_blank" rel="noopener noreferrer" {...props} />
              ),
              code: ({ node, inline, className, children, ...props }) => {
                if (inline) {
                  return (
                    <code className="ai-inline-code" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <div className="ai-code-block">
                    <div className="ai-code-header">
                      <span className="ai-code-language">
                        {className?.replace('language-', '') || 'code'}
                      </span>
                    </div>
                    <pre className="ai-pre">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              },
              blockquote: ({ node, ...props }) => (
                <blockquote className="ai-blockquote" {...props} />
              ),
            }}
          >
            {text}
          </ReactMarkdown>
        )}
      </div>

      {showEmailModal && (
        <EmailModal text={text} isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} />
      )}
    </div>
  );
};

export default AiResponse;
