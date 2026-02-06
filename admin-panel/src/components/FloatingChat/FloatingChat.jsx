import { useState, useEffect } from 'react';
import { getEvents, getUnreadCount, getChatUsers, getDMUnreadCount, getDMUnreadPerUser } from '../../services/api';
import EventChat from '../EventChat/EventChat';
import DirectChat from './DirectChat';
import './FloatingChat.css';

function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('groups'); // 'groups' or 'users'

  // Data
  const [userEvents, setUserEvents] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Counts
  const [eventUnreadCount, setEventUnreadCount] = useState(0);
  const [dmUnreadCount, setDmUnreadCount] = useState(0);
  const [userUnreadCounts, setUserUnreadCounts] = useState({}); // Per-user unread counts
  const [eventUnreadCounts, setEventUnreadCounts] = useState({}); // Per-event unread counts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchData();
    // Refresh unread counts every 30 seconds
    const interval = setInterval(fetchUnreadCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      await Promise.all([
        fetchEvents(),
        fetchUsers(),
        fetchUnreadCounts()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load chat data';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const eventsRes = await getEvents({ isActive: true });
      setUserEvents(eventsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  };

  const fetchUsers = async () => {
    try {
      // Check authentication
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      console.log('=== AUTH DEBUG ===');
      console.log('Token exists:', !!token);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'NULL');
      console.log('User string:', userStr);

      let user = {};
      try {
        user = JSON.parse(userStr || '{}');
        console.log('Parsed user:', user);
      } catch (parseError) {
        console.error('Failed to parse user from localStorage:', parseError);
        throw new Error('Invalid user data. Please log in again.');
      }

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Backend returns 'id' not '_id'
      const userId = user._id || user.id;
      if (!userId) {
        throw new Error('User ID missing. Please log in again.');
      }

      console.log('User ID:', userId);

      console.log('Auth validated. Fetching chat users...');
      const usersRes = await getChatUsers();
      console.log('Chat users response:', usersRes.data);
      setChatUsers(usersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const [eventUnread, dmUnread, dmPerUser] = await Promise.all([
        getUnreadCount(),
        getDMUnreadCount(),
        getDMUnreadPerUser()
      ]);

      // Store total unread count
      setEventUnreadCount(eventUnread.data.data?.totalUnread || 0);
      setDmUnreadCount(dmUnread.data.data?.unreadCount || 0);
      setUserUnreadCounts(dmPerUser.data.data || {});

      // Store per-event unread counts as object { eventId: count }
      const eventCountsObj = {};
      if (eventUnread.data.data?.byEvent) {
        eventUnread.data.data.byEvent.forEach(item => {
          eventCountsObj[item.eventId] = item.unreadCount;
        });
      }
      setEventUnreadCounts(eventCountsObj);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const totalUnread = eventUnreadCount + dmUnreadCount;

  const handleButtonClick = () => {
    if (isOpen) {
      // Close chat
      setIsOpen(false);
      setSelectedEvent(null);
      setSelectedUser(null);
    } else {
      // Open modal
      setShowModal(true);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setSelectedUser(null);
    setShowModal(false);
    setIsOpen(true);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedEvent(null);
    setShowModal(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedEvent(null);
    setSelectedUser(null);
  };

  const handleBackToList = () => {
    setIsOpen(false);
    setSelectedEvent(null);
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleMessagesRead = () => {
    // Refresh unread counts when messages are marked as read
    fetchUnreadCounts();
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="floating-chat-button" onClick={handleButtonClick}>
        <div className="chat-button-icon">💬</div>
        {totalUnread > 0 && (
          <div className="chat-button-badge">{totalUnread > 99 ? '99+' : totalUnread}</div>
        )}
      </div>

      {/* Selection Modal */}
      {showModal && (
        <div className="floating-chat-modal">
          <div className="floating-chat-header">
            <h3>Messages</h3>
            <button className="floating-chat-close" onClick={() => setShowModal(false)}>
              ✕
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              padding: '10px',
              margin: '10px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c33'
            }}>
              <strong>⚠️ Error:</strong> {error}
              <button
                onClick={fetchData}
                style={{
                  marginLeft: '10px',
                  padding: '4px 8px',
                  background: '#c33',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="floating-chat-tabs">
            <button
              className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
              onClick={() => setActiveTab('groups')}
            >
              <span className="tab-icon">📅</span>
              Groups
              {eventUnreadCount > 0 && (
                <span className="tab-badge">{eventUnreadCount}</span>
              )}
            </button>
            <button
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="tab-icon">👤</span>
              Users
              {dmUnreadCount > 0 && (
                <span className="tab-badge">{dmUnreadCount}</span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="floating-chat-content-list">
            {loading ? (
              <div className="floating-chat-loading">Loading...</div>
            ) : activeTab === 'groups' ? (
              // Groups (Events) Tab
              userEvents.length === 0 ? (
                <div className="floating-chat-empty">
                  <div className="empty-icon">📅</div>
                  <p>No events available</p>
                  <span>You need to be assigned to events to chat</span>
                </div>
              ) : (
                userEvents.map((event) => {
                  const unreadCount = eventUnreadCounts[event._id] || 0;
                  return (
                    <div
                      key={event._id}
                      className="floating-chat-item"
                      onClick={() => handleEventSelect(event)}
                    >
                      <div className="item-avatar event-avatar">📅</div>
                      <div className="item-info">
                        <div className="item-name">{event.name}</div>
                        <div className="item-meta">
                          <span className={`status-badge ${event.status.toLowerCase()}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                      {unreadCount > 0 && (
                        <div className="item-badge">{unreadCount}</div>
                      )}
                      <div className="item-arrow">→</div>
                    </div>
                  );
                })
              )
            ) : (
              // Users (Direct Messages) Tab
              chatUsers.length === 0 ? (
                <div className="floating-chat-empty">
                  <div className="empty-icon">👤</div>
                  <p>No users available</p>
                  <span>No other users in the system</span>
                </div>
              ) : (
                // Sort users: those with unread messages first, then by last message time
                [...chatUsers]
                  .sort((a, b) => {
                    const aUnread = userUnreadCounts[a._id];
                    const bUnread = userUnreadCounts[b._id];

                    // Users with unread messages first
                    if (aUnread && !bUnread) return -1;
                    if (!aUnread && bUnread) return 1;

                    // If both have unread, sort by last message time
                    if (aUnread && bUnread) {
                      return new Date(bUnread.lastMessageTime) - new Date(aUnread.lastMessageTime);
                    }

                    // Otherwise, keep original order
                    return 0;
                  })
                  .map((user) => {
                    const unreadInfo = userUnreadCounts[user._id];
                    const unreadCount = unreadInfo?.count || 0;

                    return (
                      <div
                        key={user._id}
                        className="floating-chat-item"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="item-avatar user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="item-info">
                          <div className="item-name">{user.name}</div>
                          <div className="item-meta">
                            <span className="user-role">{user.role}</span>
                          </div>
                        </div>
                        {unreadCount > 0 && (
                          <div className="item-badge">{unreadCount}</div>
                        )}
                        <div className="item-arrow">→</div>
                      </div>
                    );
                  })
              )
            )}
          </div>
        </div>
      )}

      {/* Chat Popup */}
      {isOpen && (selectedEvent || selectedUser) && (
        <div className="floating-chat-popup">
          <div className="floating-chat-popup-header">
            <div className="popup-header-info">
              <h3>{selectedEvent ? selectedEvent.name : selectedUser?.name}</h3>
              <button className="popup-back-btn" onClick={handleBackToList}>
                ← Back
              </button>
            </div>
            <button className="popup-close-btn" onClick={handleClose}>
              ✕
            </button>
          </div>

          <div className="floating-chat-content">
            {selectedEvent ? (
              <EventChat
                eventId={selectedEvent._id}
                eventName={selectedEvent.name}
                isOpen={true}
                onClose={handleClose}
                onMessagesRead={handleMessagesRead}
              />
            ) : (
              <DirectChat
                recipientId={selectedUser._id}
                recipientName={selectedUser.name}
                isOpen={true}
                onClose={handleClose}
                onMessagesRead={handleMessagesRead}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingChat;
