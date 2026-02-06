import { useState, useEffect, useCallback, useRef } from 'react';
import pubnubService from '../../services/pubnubService';
import { getDMToken, getDirectMessages, sendDirectMessage, markDMAsRead } from '../../services/api';
import ChatMessages from '../EventChat/ChatMessages';
import ChatInput from '../EventChat/ChatInput';
import '../EventChat/EventChat.css';

function DirectChat({ recipientId, recipientName, isOpen, onClose, onMessagesRead }) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const initializedRef = useRef(false);
  const messagesEndRef = useRef(null);

  // Helper to get user from localStorage with normalized ID
  const getCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Backend returns 'id', but some parts expect '_id'
    if (user.id && !user._id) {
      user._id = user.id;
    }
    return user;
  };

  // Get DM channel name (consistent ordering)
  const getDMChannelName = (userId1, userId2) => {
    const ids = [userId1.toString(), userId2.toString()].sort();
    return `dm-${ids[0]}-${ids[1]}`;
  };

  useEffect(() => {
    if (!recipientId || initializedRef.current) return;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError('');

        const user = getCurrentUser();
        if (!user._id) {
          setError('User not authenticated - please log in');
          setLoading(false);
          return;
        }

        // Fetch DM PubNub token
        const tokenResponse = await getDMToken();
        const { token } = tokenResponse.data.data;

        // Initialize PubNub
        pubnubService.initialize(user._id, token);

        // Fetch initial messages
        const messagesResponse = await getDirectMessages(recipientId, { limit: 50 });
        const initialMessages = messagesResponse.data.data.map(msg => {
          const isOwn = msg.sender?._id === user._id;
          const isRead = msg.readBy?.some(r => r.user.toString() === recipientId.toString());
          return {
            id: msg._id,
            user: {
              id: msg.sender?._id,
              name: msg.sender?.name || 'Unknown',
              role: msg.sender?.role,
              avatar: msg.sender?.name?.[0] || 'U'
            },
            text: msg.content,
            timestamp: new Date(msg.createdAt),
            isOwn,
            isRead: isOwn ? isRead : false, // Only show read status for own messages
            messageType: msg.messageType || 'text'
          };
        });

        setMessages(initialMessages.reverse());

        // Subscribe to DM channel
        const channelName = getDMChannelName(user._id, recipientId);
        console.log('Subscribing to DM channel:', channelName);
        pubnubService.subscribe(
          channelName, // Use full channel name for DM
          handleIncomingMessage,
          null,
          handleStatusEvent,
          true // isDM flag
        );

        initializedRef.current = true;
        setIsConnected(true);
        setLoading(false);

        // Mark messages as read
        try {
          await markDMAsRead(recipientId);
          // Notify parent to refresh unread counts
          if (onMessagesRead) {
            onMessagesRead();
          }
        } catch (err) {
          console.error('Error marking messages as read:', err);
          // Don't show error to user, just log it
        }
      } catch (err) {
        console.error('DM initialization error:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Failed to connect to chat';
        setError(errorMsg);
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (initializedRef.current) {
        const user = getCurrentUser();
        if (user._id) {
          const channelName = getDMChannelName(user._id, recipientId);
          pubnubService.unsubscribe(channelName, true); // isDM flag
        }
        initializedRef.current = false;
      }
    };
  }, [recipientId]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const handleIncomingMessage = useCallback((message) => {
    const user = getCurrentUser();

    if (message.type === 'message_deleted') {
      setMessages(prev => prev.filter(msg => msg.id !== message.messageId));
      return;
    }

    // Handle read receipt updates
    if (message.type === 'message_read') {
      setMessages(prev => prev.map(msg => {
        if (msg.id === message.messageId && msg.isOwn) {
          return { ...msg, isRead: true };
        }
        return msg;
      }));
      return;
    }

    const isOwn = message.sender.id === user._id;
    const newMessage = {
      id: message.messageId,
      user: {
        id: message.sender.id,
        name: message.sender.name,
        role: message.sender.role,
        avatar: message.sender.name[0]
      },
      text: message.content,
      timestamp: new Date(message.timestamp),
      isOwn,
      isRead: false, // New messages start as unread
      messageType: message.messageType || 'text'
    };

    setMessages(prev => {
      if (prev.some(msg => msg.id === newMessage.id)) {
        return prev;
      }

      // Play notification sound for incoming messages (not own messages)
      if (!newMessage.isOwn) {
        playNotificationSound();
      }

      return [...prev, newMessage];
    });
  }, []);

  const handleStatusEvent = useCallback((event) => {
    const connectedCategories = ['PNConnectedCategory', 'PNReconnectedCategory'];
    const disconnectedCategories = ['PNNetworkDownCategory', 'PNNetworkIssuesCategory'];

    if (connectedCategories.includes(event.category)) {
      setIsConnected(true);
      setError('');
    } else if (disconnectedCategories.includes(event.category)) {
      setIsConnected(false);
      setError('Connection lost. Reconnecting...');
    }
  }, []);

  const sendMessage = useCallback(async (text, fileData = null) => {
    if ((!text.trim() && !fileData) || sending) return;

    try {
      setSending(true);
      setError('');

      const user = getCurrentUser();

      // Optimistic update
      const tempMessage = {
        id: `temp-${Date.now()}`,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          avatar: user.name[0]
        },
        text: text.trim(),
        timestamp: new Date(),
        isOwn: true,
        isSending: true,
        ...(fileData && { attachments: fileData.attachments, messageType: fileData.messageType })
      };

      setMessages(prev => [...prev, tempMessage]);

      // Send to backend
      await sendDirectMessage(recipientId, {
        content: text.trim(),
        messageType: fileData?.messageType || 'text',
        ...(fileData?.attachments && { attachments: fileData.attachments })
      });

      // Remove temp message (real one will come from PubNub)
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));

      setSending(false);
    } catch (err) {
      console.error('Send DM error:', err);
      setError('Failed to send message');
      setSending(false);
      setMessages(prev => prev.filter(msg => !msg.isSending));
    }
  }, [recipientId, sending]);

  const loadMore = useCallback(async () => {
    if (messages.length === 0) return;

    try {
      const oldestMessage = messages[0];
      const before = oldestMessage.timestamp.toISOString();

      const messagesResponse = await getDirectMessages(recipientId, {
        limit: 25,
        before
      });

      const user = getCurrentUser();
      const olderMessages = messagesResponse.data.data.map(msg => {
        const isOwn = msg.sender?._id === user._id;
        const isRead = msg.readBy?.some(r => r.user.toString() === recipientId.toString());
        return {
          id: msg._id,
          user: {
            id: msg.sender?._id,
            name: msg.sender?.name || 'Unknown',
            role: msg.sender?.role,
            avatar: msg.sender?.name?.[0] || 'U'
          },
          text: msg.content,
          timestamp: new Date(msg.createdAt),
          isOwn,
          isRead: isOwn ? isRead : false,
          messageType: msg.messageType || 'text'
        };
      });

      if (olderMessages.length > 0) {
        setMessages(prev => [...olderMessages.reverse(), ...prev]);
      }
    } catch (err) {
      console.error('Load more DMs error:', err);
    }
  }, [recipientId, messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  if (!isOpen) return null;

  return (
    <div className="event-chat-sidebar">
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

export default DirectChat;
