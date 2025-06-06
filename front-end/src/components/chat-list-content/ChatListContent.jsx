import LoadingState from '../loading-state/LoadingState';
import ChatItem from '../chat-item/ChatItem';

const ChatListContent = ({
  isPending,
  error,
  chats,
  isSearching,
  searchResults,
  searchQuery,
  searchAttempted,
  groupedChats,
  isActive,
  editingChatId,
  editingTitle,
  setEditingTitle,
  handleEdit,
  startEditing,
  openDeleteModel,
  openShareModal,
}) => {
  if (isPending) {
    return (
      <div className="loading-state">
        <LoadingState message="Loading chats..." />
      </div>
    );
  }

  if (error) {
    return <div className="error-message">Something went wrong. Please try again later.</div>;
  }

  if (chats.length === 0) {
    return (
      <div className="empty-state">
        No chats yet. Start a conversation to see your chat history.
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="loading-state">
        <LoadingState message="Searching chats..." />
      </div>
    );
  }

  if (searchResults.length > 0) {
    return (
      <div>
        <h2 className="monthYear">Search Results</h2>
        {searchResults
          .filter(chat => chat.type !== 'custom_template')
          .map(chat => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={isActive}
              editingChatId={editingChatId}
              editingTitle={editingTitle}
              setEditingTitle={setEditingTitle}
              handleEdit={handleEdit}
              startEditing={startEditing}
              openDeleteModel={openDeleteModel}
            />
          ))}
      </div>
    );
  }

  if (searchQuery && searchAttempted) {
    return <div className="empty-state">No result found for "{searchQuery}"</div>;
  }

  return (
    <>
      {Object.entries(groupedChats).map(([monthYear, group]) => (
        <div key={monthYear}>
          <h2 className="monthYear">{monthYear}</h2>
          {group
            .filter(chat => chat.type !== 'custom_template')
            .map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={isActive}
                editingChatId={editingChatId}
                editingTitle={editingTitle}
                setEditingTitle={setEditingTitle}
                handleEdit={handleEdit}
                startEditing={startEditing}
                openDeleteModel={openDeleteModel}
                openShareModal={openShareModal}
              />
            ))}
        </div>
      ))}
    </>
  );
};

export default ChatListContent;
