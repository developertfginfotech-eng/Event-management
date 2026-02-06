import { usePubNubChat } from '../../hooks/usePubNubChat';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import './EventChat.css';

function EventChat({ eventId, eventName, isOpen, onClose, onMessagesRead }) {
  const {
    messages,
    sendMessage,
    loadMore,
    isConnected,
    onlineUsers,
    error,
    loading,
    sending,
    messagesEndRef,
    handleLocalDelete
  } = usePubNubChat(eventId, onMessagesRead);

  if (!isOpen) return null;

  return (
    <div className="event-chat-sidebar">
      <ChatHeader
        eventName={eventName}
        onlineCount={onlineUsers.length}
        isConnected={isConnected}
        onClose={onClose}
      />

      {error && (
        <div className="chat-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="chat-loading">
          <div className="loading-spinner"></div>
          <p>Connecting to chat...</p>
        </div>
      ) : (
        <>
          <ChatMessages
            messages={messages}
            onLoadMore={loadMore}
            messagesEndRef={messagesEndRef}
            onDeleteMessage={handleLocalDelete}
          />

          <ChatInput
            onSend={sendMessage}
            disabled={!isConnected || sending}
            sending={sending}
          />
        </>
      )}
    </div>
  );
}

export default EventChat;
