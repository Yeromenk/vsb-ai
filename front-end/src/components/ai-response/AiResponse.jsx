import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Copy, CheckCircle, Mail, Edit, X, Save } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import 'highlight.js/styles/github.css';
import './AiResponse.css';

const AiResponse = ({ text, onEdit, showEditButton = false, showEmailButton = false }) => {
  const [copied, setCopied] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('AI Assistant Response');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);

  useEffect(() => {
    setEditedText(text);
  }, [text]);

  const handleCopy = () => {
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

  const handleSendEmail = async () => {
    if (!recipient) {
      toast.error('Please enter a recipient email');
      return;
    }

    setSendingEmail(true);
    try {
      await axios.post(
        'http://localhost:3000/ai/send-email',
        {
          to: recipient,
          subject: subject,
          content: text,
        },
        { withCredentials: true }
      );

      toast.success('Email sent successfully');
      setShowEmailModal(false);
    } catch (error) {
      toast.error('Failed to send email: ' + (error.response?.data?.message || error.message));
      console.error('Email error:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className={`ai-response-container ${isEditing ? 'editing' : ''}`}>
      <div className="ai-response-actions">
        <button
          className="ai-action-button copy-button"
          onClick={handleCopy}
          aria-label="Copy text"
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
        <div className="email-modal-overlay">
          <div className="email-modal">
            <h2>Send as Email</h2>
            <div className="email-form">
              <div className="email-form-group">
                <label>To:</label>
                <input
                  type="email"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="recipient@example.com"
                  required
                />
              </div>
              <div className="email-form-group">
                <label>Subject:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>
              <div className="email-preview">
                <h3>Content Preview:</h3>
                <div className="email-content-preview">
                  <div className="plain-text-preview">
                    {text.length > 1000 ? text.substring(0, 1000) + '...' : text}
                  </div>
                </div>
              </div>
              <div className="email-modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowEmailModal(false)}
                  disabled={sendingEmail}
                >
                  Cancel
                </button>
                <button
                  className="send-button-email"
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !recipient}
                >
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiResponse;
