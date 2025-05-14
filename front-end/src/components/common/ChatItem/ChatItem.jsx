import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';

const ChatItem = ({
  chat,
  isActive,
  editingChatId,
  editingTitle,
  handleEdit,
  startEditing,
  setEditingTitle,
  openDeleteModel,
}) => {
  // chat path
  let chatPath;
  switch (chat.type) {
    case 'translate':
      chatPath = `/translate/chat/${chat.id}`;
      break;
    case 'file':
      chatPath = `/file/chat/${chat.id}`;
      break;
    case 'format':
      chatPath = `/format/chat/${chat.id}`;
      break;
    case 'custom_conversation':
      chatPath = `/custom/chat/${chat.id}`;
      break;
    default:
      chatPath = `/chat/${chat.id}`;
  }

  return (
    <div className="chatsLinks">
      <Link to={chatPath} className={isActive(chatPath) ? 'active-chat' : ''}>
        <div className="chat-item">
          {editingChatId === chat.id ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleEdit(chat.id, editingTitle);
              }}
            >
              <input
                type="text"
                value={editingTitle}
                onChange={e => setEditingTitle(e.target.value)}
                onBlur={() => handleEdit(chat.id, editingTitle)}
                autoFocus
              />
            </form>
          ) : (
            <>
              <div className="chat-content">
                <span className="chat-title">{chat.title}</span>

                {/* Display context excerpts if available */}
                {chat.matchExcerpts && chat.matchExcerpts.length > 0 && (
                  <div className="search-excerpts">
                    {chat.matchExcerpts.slice(0, 2).map((excerpt, i) => (
                      <div key={i} className={`excerpt ${excerpt.role}`}>
                        <span className="excerpt-text">{excerpt.excerpt}</span>
                      </div>
                    ))}
                    {chat.matchExcerpts.length > 2 && (
                      <div className="more-excerpts">
                        +{chat.matchExcerpts.length - 2} more matches
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="chat-icons" onClick={e => e.stopPropagation()}>
                <Pencil
                  className="icon-edit-icon"
                  onClick={e => {
                    e.preventDefault();
                    startEditing(chat);
                  }}
                />
                <Trash2
                  className="icon-delete-icon"
                  onClick={e => {
                    e.preventDefault();
                    openDeleteModel(chat);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ChatItem;
