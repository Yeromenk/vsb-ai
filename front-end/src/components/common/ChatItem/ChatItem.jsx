import { Link } from 'react-router-dom';
import { MoreVertical, Edit2, Trash2, Share } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ChatItem = ({
  chat,
  isActive,
  editingChatId,
  editingTitle,
  handleEdit,
  startEditing,
  setEditingTitle,
  openDeleteModel,
  openShareModal,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({
    top: 0,
    left: 0,
  });
  const moreBtnRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = e => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !moreBtnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Position menu near the button
  const handleMenuOpen = e => {
    e.preventDefault();
    e.stopPropagation();
    const rect = moreBtnRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: rect.left - 120 + rect.width,
    });
    setMenuOpen(prev => !prev);
  };

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
    <div className="chatsLinks" style={{ position: 'relative' }}>
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
                <button
                  className="icon-more-button"
                  ref={moreBtnRef}
                  onClick={handleMenuOpen}
                  aria-label="More actions"
                  type="button"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      </Link>
      {menuOpen &&
        createPortal(
          <div
            className="chat-item-menu"
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              zIndex: 9999,
            }}
          >
            <button
              className="chat-item-menu-action rename-action"
              onClick={() => {
                startEditing(chat);
                setMenuOpen(false);
              }}
            >
              <Edit2 size={16} />
              <span>Rename</span>
            </button>
            <button
              className="chat-item-menu-action delete-action"
              onClick={() => {
                openDeleteModel(chat);
                setMenuOpen(false);
              }}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
            <button
              className="chat-item-menu-action share-action"
              onClick={() => {
                openShareModal(chat);
                setMenuOpen(false);
              }}
            >
              <Share size={16} />
              <span>Share</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ChatItem;
