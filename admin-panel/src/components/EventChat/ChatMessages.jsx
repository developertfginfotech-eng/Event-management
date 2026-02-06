import MessageBubble from './MessageBubble';

function ChatMessages({ messages, onLoadMore, messagesEndRef, onDeleteMessage }) {
  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    // Load more when scrolled near top
    if (scrollTop < 100 && messages.length > 0) {
      onLoadMore();
    }
  };

  return (
    <div className="chat-messages" onScroll={handleScroll}>
      {messages.length === 0 ? (
        <div className="chat-empty">
          <div className="empty-icon">💬</div>
          <p>No messages yet</p>
          <span>Start the conversation!</span>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onDeleteMessage={onDeleteMessage} />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}

export default ChatMessages;
