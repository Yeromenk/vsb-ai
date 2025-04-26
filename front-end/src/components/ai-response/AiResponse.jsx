import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Copy, CheckCircle } from 'lucide-react';
import 'highlight.js/styles/github.css';
import './AiResponse.css';

const AiResponse = ({ text }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
    })
  }

  return (
    <div className="ai-response-container">
      <div className="copy-button-container">
        <button
          className="copy-button"
          onClick={handleCopy}
          aria-label="Copy text"
        >
          {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          <span className="tooltip-text">
            {copied ? 'Copied!' : 'Copy text'}
          </span>
        </button>
      </div>
      <div className="ai-response">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h1 className="ai-heading ai-h1" {...props} />,
            h2: ({ node, ...props }) => <h2 className="ai-heading ai-h2" {...props} />,
            h3: ({ node, ...props }) => <h3 className="ai-heading ai-h3" {...props} />,
            ul: ({ node, ...props }) => <ul className="ai-list" {...props} />,
            ol: ({ node, ...props }) => <ol className="ai-ordered-list" {...props} />,
            li: ({ node, ...props }) => <li className="ai-list-item" {...props} />,
            a: ({ node, ...props }) => <a className="ai-link" target="_blank" rel="noopener noreferrer" {...props} />,
            code: ({node, inline, className, children, ...props}) => {
              if (inline) {
                return <code className="ai-inline-code" {...props}>{children}</code>
              }
              return <div className="ai-code-block">
                <div className="ai-code-header">
                  <span className="ai-code-language">{className?.replace('language-','') || 'code'}</span>
                </div>
                <pre className="ai-pre">
                  <code className={className} {...props}>{children}</code>
                </pre>
              </div>
            },
            blockquote: ({ node, ...props }) => <blockquote className="ai-blockquote" {...props} />,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default AiResponse;