import React from 'react';
import LoadingState from '../LoadingState/LoadingState';
import AiResponse from '../../ai-response/AiResponse';
import Skeleton from 'react-loading-skeleton';

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
  const firstLetter = currentUser?.username.charAt(0).toUpperCase();

  if (isLoading) return <LoadingState message="Loading..." />;

  if (error && !unauthorized) {
    return <div className="error-state">An error occurred</div>;
  }

  return (
    <div className="message-content-wrapper">
      {chat?.history?.map((message, index) => (
        <div key={index} className="message-container">
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
            <Skeleton width="10rem" />
          </div>
        </div>
      )}

      {/* Reference for scrolling to the bottom */}
      <div ref={endRef} />
    </div>
  );
};

export default ChatMessages;
