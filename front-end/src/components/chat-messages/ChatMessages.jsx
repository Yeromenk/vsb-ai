import React from 'react';
import AiResponse from '../ai-response/AiResponse';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ChatMessages = ({
  chat,
  isLoading,
  error,
  unauthorized,
  pendingMessage,
  loading,
  endRef,
  currentUser,
  onEditAiResponse,
  showEditButton,
  showEmailButton,
}) => {
  const firstLetter = currentUser?.username?.charAt(0).toUpperCase() || '?';

  if (isLoading) {
    return (
      <div className="message-content-wrapper">
        {[1, 2, 3].map(item => (
          <React.Fragment key={item}>
            {/* User message skeleton */}
            <div className="message-container">
              <div className="user-message skeleton-message">
                <Skeleton
                  count={1}
                  height={20}
                  style={{
                    marginBottom: '10px',
                    width: '70%',
                  }}
                />
              </div>
              <div className="avatar user-avatar skeleton-avatar">
                <Skeleton circle width={40} height={40} />
              </div>
            </div>

            {/* AI response skeleton */}
            <div className="message-container">
              <div className="avatar model-avatar">
                <Skeleton circle width={40} height={40} />
              </div>
              <div className="model-message skeleton-message">
                <Skeleton count={3} height={20} style={{ marginBottom: '10px' }} />
                <Skeleton width="80%" height={20} />
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (error && !unauthorized) {
    return <div className="error-state">An error occurred</div>;
  }

  return (
    <div className="message-content-wrapper">
      {chat?.history
        ?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((message, index) => (
          <div key={message.id || index} className="message-container">
            {message.role === 'user' ? (
              <>
                <div className="user-message">{message.text}</div>
                <div className="avatar user-avatar">{firstLetter}</div>
              </>
            ) : (
              <>
                <div className="avatar model-avatar">
                  <img src="/vsb-logo.jpg" alt="vsb-logo" />
                </div>
                <div className="model-message">
                  <AiResponse
                    text={message.text}
                    showEditButton={showEditButton}
                    showEmailButton={showEmailButton}
                    onEdit={editedText =>
                      onEditAiResponse && onEditAiResponse(index, message.id, editedText)
                    }
                    metadata={message.metadata || {}}
                  />
                </div>
              </>
            )}
          </div>
        ))}

      {/* Show a pending user message */}
      {pendingMessage && (
        <div className="message-container">
          <div className="user-message">{pendingMessage}</div>
          <div className="avatar user-avatar">{firstLetter}</div>
        </div>
      )}

      {/* Show AI loading state */}
      {loading && (
        <div className="message-container">
          <div className="avatar model-avatar">
            <img src="/vsb-logo.jpg" alt="vsb-logo" />
          </div>
          <div className="model-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      {/* Reference for scrolling to the bottom */}
      <div ref={endRef} />
    </div>
  );
};

export default ChatMessages;
