function ChatHeader({ eventName, onlineCount, isConnected, onClose }) {
  return (
    <div className="chat-header">
      <div className="chat-header-content">
        <div className="chat-title">
          <h3>{eventName}</h3>
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span className="status-text">
              {isConnected ? `${onlineCount} online` : 'Connecting...'}
            </span>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
          ✕
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
