import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Edit,
  Save,
  RefreshCcw,
  Mail,
  RefreshCw,
  AtSign,
  MessageSquare,
  Ban,
  CheckCircle,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './EmailModal.css';

const EmailModal = ({ text, isOpen, onClose }) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [emailContent, setEmailContent] = useState(text);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEmailContent(text);
  }, [text]);

  const validateEmail = email => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleRecipientChange = e => {
    const email = e.target.value;
    setRecipient(email);

    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSendEmail = async () => {
    if (!recipient) {
      toast.error('Please enter a recipient email');
      return;
    }

    if (!validateEmail(recipient)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    try {
      await axios.post(
        'http://localhost:3000/ai/send-email',
        {
          to: recipient,
          subject: subject || 'AI Assistant Response',
          content: emailContent,
        },
        { withCredentials: true }
      );

      toast.success('Email sent successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to send email: ' + (error.response?.data?.message || error.message));
      console.error('Email error:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(emailContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="email-modal-overlay">
      <div className="email-modal">
        <h2>Send Email</h2>
        <div className="email-form">
          <div className="email-form-group">
            <label>To:</label>
            <div className="input-with-icon">
              <AtSign size={18} className="input-icon-email" />
              <input
                type="email"
                value={recipient}
                onChange={handleRecipientChange}
                placeholder="recipient@example.com"
                required
                className={emailError ? 'input-error' : ''}
              />
            </div>
            {emailError && <div className="email-error-message">{emailError}</div>}
          </div>
          <div className="email-form-group">
            <label>Subject:</label>
            <div className="input-with-icon">
              <MessageSquare size={18} className="input-icon-email" />
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="AI Assistant Response"
              />
            </div>
          </div>
          <div className="email-form-group">
            <label>Content Preview:</label>
            <div className="email-preview">
              <div className="email-preview-actions">
                <button
                  className="email-action-button copy-email-button"
                  onClick={handleCopyContent}
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  <span className="email-tooltip-text">{copied ? 'Copied!' : 'Copy content'}</span>
                </button>

                <button
                  className="email-action-button reset-email-button"
                  onClick={() => setEmailContent(text)}
                  disabled={emailContent === text}
                >
                  <RefreshCcw size={16} />
                  <span className="email-tooltip-text">Reset content</span>
                </button>

                <button
                  className="email-action-button edit-email-button"
                  onClick={() => setIsEditingEmail(!isEditingEmail)}
                >
                  {isEditingEmail ? <Save size={16} /> : <Edit size={16} />}
                  <span className="email-tooltip-text">
                    {isEditingEmail ? 'Save content' : 'Edit content'}
                  </span>
                </button>
              </div>
              <div className="email-content-preview">
                {isEditingEmail ? (
                  <textarea
                    value={emailContent}
                    onChange={e => setEmailContent(e.target.value)}
                    className="email-edit-textarea"
                  />
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
                        <a
                          className="ai-link"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="ai-blockquote" {...props} />
                      ),
                    }}
                  >
                    {emailContent}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
          <div className="email-modal-actions">
            <button className="cancel-button-email" onClick={onClose} disabled={sendingEmail}>
              <span>Cancel</span>
              <Ban size={18} />
            </button>
            <button
              className="send-button-email"
              onClick={handleSendEmail}
              disabled={sendingEmail || !recipient || !!emailError}
            >
              {sendingEmail ? (
                <>
                  <RefreshCw size={18} className="icon-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail size={18} />
                  <span>Send Email</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
