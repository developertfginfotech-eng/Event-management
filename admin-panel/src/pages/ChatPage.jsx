import { useState, useEffect } from 'react';
import { getEvents, getUnreadCount, getChatUsers, getDMUnreadCount, getDMUnreadPerUser } from '../services/api';
import EventChat from '../components/EventChat/EventChat';
import DirectChat from '../components/FloatingChat/DirectChat';
import './ChatPage.css';

function ChatPage() {
  const [activeTab, setActiveTab] = useState('groups');


  const [userEvents, setUserEvents] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Counts
  const [eventUnreadCount, setEventUnreadCount] = useState(0);
  const [dmUnreadCount, setDmUnreadCount] = useState(0);
  const [userUnreadCounts, setUserUnreadCounts] = useState({});
  const [eventUnreadCounts, setEventUnreadCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
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
      const usersRes = await getChatUsers();
      setChatUsers(usersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
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

      setEventUnreadCount(eventUnread.data.data?.totalUnread || 0);
      setDmUnreadCount(dmUnread.data.data?.unreadCount || 0);
      setUserUnreadCounts(dmPerUser.data.data || {});

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

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setSelectedUser(null);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedEvent(null);
  };

  const handleMessagesRead = () => {
    fetchUnreadCounts();
  };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
        </div>

        <div className="chat-tabs">
          <button
            className={`chat-tab ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            <span className="tab-icon">📅</span>
            <span>Groups</span>
            {eventUnreadCount > 0 && (
              <span className="tab-badge">{eventUnreadCount}</span>
            )}
          </button>
          <button
            className={`chat-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="tab-icon">👤</span>
            <span>Users</span>
            {dmUnreadCount > 0 && (
              <span className="tab-badge">{dmUnreadCount}</span>
            )}
          </button>
        </div>

        <div className="chat-search">
          <input
            type="text"
            placeholder="Search chats..."
            className="search-input"
          />
        </div>

        {error && (
          <div className="chat-error-banner">
            <span>⚠️ {error}</span>
            <button onClick={fetchData}>Retry</button>
          </div>
        )}

        <div className="chat-list">
          {loading ? (
            <div className="chat-loading">Loading...</div>
          ) : activeTab === 'groups' ? (
            userEvents.length === 0 ? (
              <div className="chat-empty">
                <div className="empty-icon">📅</div>
                <p>No events available</p>
                <span>You need to be assigned to events</span>
              </div>
            ) : (
              userEvents.map((event) => {
                const unreadCount = eventUnreadCounts[event._id] || 0;
                const isSelected = selectedEvent?._id === event._id;

                return (
                  <div
                    key={event._id}
                    className={`chat-list-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleEventSelect(event)}
                  >
                    <div className="chat-avatar event-avatar">📅</div>
                    <div className="chat-info">
                      <div className="chat-name">{event.name}</div>
                      <div className="chat-meta">
                        <span className={`status-tag ${event.status.toLowerCase()}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <div className="unread-badge">{unreadCount}</div>
                    )}
                  </div>
                );
              })
            )
          ) : (
            chatUsers.length === 0 ? (
              <div className="chat-empty">
                <div className="empty-icon">👤</div>
                <p>No users available</p>
              </div>
            ) : (
              [...chatUsers]
                .sort((a, b) => {
                  const aUnread = userUnreadCounts[a._id];
                  const bUnread = userUnreadCounts[b._id];
                  if (aUnread && !bUnread) return -1;
                  if (!aUnread && bUnread) return 1;
                  return 0;
                })
                .map((user) => {
                  const unreadInfo = userUnreadCounts[user._id];
                  const unreadCount = unreadInfo?.count || 0;
                  const isSelected = selectedUser?._id === user._id;

                  return (
                    <div
                      key={user._id}
                      className={`chat-list-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="chat-avatar user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="chat-info">
                        <div className="chat-name">{user.name}</div>
                        <div className="chat-meta">
                          <span className="user-role">{user.role}</span>
                        </div>
                      </div>
                      {unreadCount > 0 && (
                        <div className="unread-badge">{unreadCount}</div>
                      )}
                    </div>
                  );
                })
            )
          )}
        </div>
      </div>

      <div className="chat-main">
        {!selectedEvent && !selectedUser ? (
          <div className="chat-placeholder">
            <div className="placeholder-icon">💬</div>
            <h3>Select a chat to start messaging</h3>
            <p>Choose a group or user from the list to view messages</p>
          </div>
        ) : selectedEvent ? (
          <EventChat
            eventId={selectedEvent._id}
            eventName={selectedEvent.name}
            isOpen={true}
            onClose={() => setSelectedEvent(null)}
            onMessagesRead={handleMessagesRead}
          />
        ) : (
          <DirectChat
            recipientId={selectedUser._id}
            recipientName={selectedUser.name}
            isOpen={true}
            onClose={() => setSelectedUser(null)}
            onMessagesRead={handleMessagesRead}
          />
        )}
      </div>
    </div>
  );
}

export default ChatPage;
