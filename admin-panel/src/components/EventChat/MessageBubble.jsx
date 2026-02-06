import { useState, useRef, useEffect } from 'react';
import { deleteMessage } from '../../services/api';

function MessageBubble({ message, onDeleteMessage }) {
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowDeleteMenu(false);
      }
    };

    if (showDeleteMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDeleteMenu]);

  const handleDelete = async (deleteType) => {
    if (deleting) return;

    try {
      setDeleting(true);
      await deleteMessage(message.id, deleteType);
      setShowDeleteMenu(false);

      // Notify parent component
      if (onDeleteMessage) {
        onDeleteMessage(message.id, deleteType);
      }
    } catch (error) {
      console.error('Delete message error:', error);
      alert(error.response?.data?.message || 'Failed to delete message');
    } finally {
      setDeleting(false);
    }
  };
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4'
    ];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  const renderAttachment = (attachment) => {
    const fileUrl = `${import.meta.env.VITE_API_URL}${attachment.url}`;

    // Image preview
    if (attachment.fileType.startsWith('image/')) {
      return (
        <div className="message-image">
          <img src={fileUrl} alt={attachment.fileName} />
          <a href={fileUrl} download={attachment.fileName} className="download-btn">
            📥 Download
          </a>
        </div>
      );
    }

    // Audio player
    if (attachment.fileType.startsWith('audio/')) {
      return (
        <div className="message-audio">
          <div className="audio-icon">🎤</div>
          <audio controls src={fileUrl} />
        </div>
      );
    }

    // File download
    return (
      <div className="message-file">
        <div className="file-info">
          <span className="file-icon">
            {attachment.fileType.includes('pdf')
              ? '📄'
              : attachment.fileType.includes('word') || attachment.fileType.includes('doc')
              ? '📝'
              : attachment.fileType.includes('excel') || attachment.fileType.includes('sheet')
              ? '📊'
              : '📎'}
          </span>
          <div className="file-details">
            <span className="file-name">{attachment.fileName}</span>
            <span className="file-size">
              {(attachment.fileSize / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>
        <a href={fileUrl} download={attachment.fileName} className="file-download-btn">
          📥
        </a>
      </div>
    );
  };

  return (
    <div className={`message-bubble ${message.isOwn ? 'own-message' : ''}`}>
      {!message.isOwn && (
        <div
          className="message-avatar"
          style={{ backgroundColor: getAvatarColor(message.user.name) }}
        >
          {message.user.avatar}
        </div>
      )}

      <div className="message-wrapper">
        {!message.isOwn && (
          <div className="message-sender">
            <span className="sender-name">{message.user.name}</span>
            {message.user.role && (
              <span className="sender-role">{message.user.role}</span>
            )}
          </div>
        )}

        <div className="message-content">
          {/* Text content */}
          {message.text && <p className="message-text">{message.text}</p>}

          {/* Attachments */}
          {message.attachments &&
            message.attachments.length > 0 &&
            message.attachments.map((attachment, index) => (
              <div key={index}>{renderAttachment(attachment)}</div>
            ))}

          <div className="message-meta">
            <span className="message-time">{formatTime(message.timestamp)}</span>
            {message.isSending && <span className="sending-indicator">Sending...</span>}
            {message.isOwn && !message.isSending && (
              <span className={`read-status ${message.isRead ? 'read' : 'sent'}`}>
                {message.isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>

        {/* Delete Menu */}
        {!message.isSending && (
          <div className="message-actions" ref={menuRef}>
            <button
              className="message-menu-btn"
              onClick={() => setShowDeleteMenu(!showDeleteMenu)}
              title="Message options"
            >
              ⋮
            </button>

            {showDeleteMenu && (
              <div className="delete-menu">
                <button
                  className="delete-option"
                  onClick={() => handleDelete('forMe')}
                  disabled={deleting}
                >
                  🗑️ Delete for me
                </button>
                {message.isOwn && (
                  <button
                    className="delete-option delete-everyone"
                    onClick={() => handleDelete('forEveryone')}
                    disabled={deleting}
                  >
                    🗑️ Delete for everyone
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {message.isOwn && (
        <div
          className="message-avatar"
          style={{ backgroundColor: getAvatarColor(message.user.name) }}
        >
          {message.user.avatar}
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
