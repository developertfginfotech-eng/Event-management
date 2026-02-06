import { useState, useEffect, useCallback, useRef } from 'react';
import pubnubService from '../services/pubnubService';
import { getChatToken, getEventMessages, sendChatMessage, markMessagesAsRead } from '../services/api';

export const usePubNubChat = (eventId, onMessagesRead) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const initializedRef = useRef(false);
  const messagesEndRef = useRef(null);

  // Helper to get user from localStorage with normalized ID
  const getCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Backend returns 'id', but we need '_id'
    if (user.id && !user._id) {
      user._id = user.id;
    }
    return user;
  };

  // Initialize PubNub and fetch initial messages
  useEffect(() => {
    if (!eventId || initializedRef.current) return;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError('');

        // Get current user
        const user = getCurrentUser();
        if (!user._id) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // Fetch PubNub token from backend
        const tokenResponse = await getChatToken();
        const { token, uuid } = tokenResponse.data.data;

        // Initialize PubNub service
        pubnubService.initialize(user._id, token);

        // Fetch initial messages from backend
        const messagesResponse = await getEventMessages(eventId, { limit: 50 });
        const initialMessages = messagesResponse.data.data.map(msg => {
          const isOwn = msg.sender?._id === user._id;
          const isRead = isOwn && msg.readBy && msg.readBy.length > 1; // More than just sender
          return {
            id: msg._id,
            user: {
              id: msg.sender?._id,
              name: msg.sender?.name || 'System',
              role: msg.sender?.role,
              avatar: msg.sender?.name?.[0] || 'S'
            },
            text: msg.content,
            timestamp: new Date(msg.createdAt),
            isOwn,
            isRead,
            messageType: msg.messageType || 'text',
            attachments: msg.attachments || []
          };
        });

        setMessages(initialMessages.reverse());

        // Mark unread messages as read
        const unreadMessageIds = messagesResponse.data.data
          .filter(msg => !msg.readBy?.some(r => r.user.toString() === user._id.toString()))
          .map(msg => msg._id);

        if (unreadMessageIds.length > 0) {
          try {
            await markMessagesAsRead(eventId, unreadMessageIds);
            // Notify parent to refresh unread counts
            if (onMessagesRead) {
              onMessagesRead();
            }
          } catch (err) {
            console.error('Error marking messages as read:', err);
            // Don't show error to user, just log it
          }
        }

        // Subscribe to PubNub channel
        console.log(`🔔 Subscribing to event channel: event-${eventId}`);
        pubnubService.subscribe(
          eventId,
          handleIncomingMessage,
          handlePresenceEvent,
          handleStatusEvent
        );

        // Fetch current online users
        fetchOnlineUsers();

        initializedRef.current = true;
        setIsConnected(true);
        setLoading(false);
        console.log('✅ Chat initialized successfully');
      } catch (err) {
        console.error('Chat initialization error:', err);
        setError('Failed to connect to chat');
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (initializedRef.current) {
        console.log(`🔕 Unsubscribing from event channel: event-${eventId}`);
        pubnubService.unsubscribe(eventId);
        initializedRef.current = false;
        setIsConnected(false);
      }
    };
  }, [eventId]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create a simple notification sound using Web Audio API
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

  // Handle incoming PubNub message
  const handleIncomingMessage = useCallback((message) => {
    console.log('📨 Received PubNub message:', message);

    const user = getCurrentUser();

    // Handle different message types
    if (message.type === 'message_deleted') {
      // Remove deleted message
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

    // Regular chat message
    const isOwn = message.sender?.id === user._id || message.sender?.id === user.id;
    const newMessage = {
      id: message.messageId,
      user: {
        id: message.sender?.id,
        name: message.sender?.name,
        role: message.sender?.role,
        avatar: message.sender?.name?.[0] || 'U'
      },
      text: message.content,
      timestamp: new Date(message.timestamp),
      isOwn,
      isRead: false, // New messages start as unread
      messageType: message.messageType || 'text',
      attachments: message.attachments || []
    };

    console.log('✅ Adding new message to state:', newMessage);

    setMessages(prev => {
      // Avoid duplicates
      if (prev.some(msg => msg.id === newMessage.id)) {
        console.log('⚠️ Duplicate message, skipping');
        return prev;
      }

      // Play notification sound for incoming messages (not own messages)
      if (!newMessage.isOwn) {
        playNotificationSound();
      }

      console.log('✅ Message added to state');
      return [...prev, newMessage];
    });
  }, []);

  // Handle presence events (user join/leave)
  const handlePresenceEvent = useCallback((event) => {
    if (event.action === 'join' || event.action === 'leave' || event.action === 'state-change') {
      fetchOnlineUsers();
    }
  }, [eventId]);

  // Handle connection status
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

  // Fetch online users
  const fetchOnlineUsers = useCallback(async () => {
    try {
      const presence = await pubnubService.getHereNow(eventId);
      const occupants = presence.occupants || [];

      const onlineUsersList = occupants.map(occupant => ({
        uuid: occupant.uuid,
        state: occupant.state
      }));

      setOnlineUsers(onlineUsersList);
    } catch (err) {
      console.error('Error fetching online users:', err);
    }
  }, [eventId]);

  // Send message
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

      // Send to backend (which will publish to PubNub)
      await sendChatMessage(eventId, {
        content: text.trim(),
        messageType: fileData?.messageType || 'text',
        ...(fileData?.attachments && { attachments: fileData.attachments })
      });

      // Remove temp message (real one will come from PubNub)
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));

      setSending(false);
    } catch (err) {
      console.error('Send message error:', err);
      setError('Failed to send message');
      setSending(false);

      // Remove failed message
      setMessages(prev => prev.filter(msg => !msg.isSending));
    }
  }, [eventId, sending]);

  // Load more messages (pagination)
  const loadMore = useCallback(async () => {
    if (messages.length === 0) return;

    try {
      const oldestMessage = messages[0];
      const before = oldestMessage.timestamp.toISOString();

      const messagesResponse = await getEventMessages(eventId, {
        limit: 25,
        before
      });

      const user = getCurrentUser();
      const olderMessages = messagesResponse.data.data.map(msg => {
        const isOwn = msg.sender?._id === user._id;
        const isRead = isOwn && msg.readBy && msg.readBy.length > 1;
        return {
          id: msg._id,
          user: {
            id: msg.sender?._id,
            name: msg.sender?.name || 'System',
            role: msg.sender?.role,
            avatar: msg.sender?.name?.[0] || 'S'
          },
          text: msg.content,
          timestamp: new Date(msg.createdAt),
          isOwn,
          isRead,
          messageType: msg.messageType || 'text',
          attachments: msg.attachments || []
        };
      });

      if (olderMessages.length > 0) {
        setMessages(prev => [...olderMessages.reverse(), ...prev]);
      }
    } catch (err) {
      console.error('Load more messages error:', err);
    }
  }, [eventId, messages]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Handle local message deletion
  const handleLocalDelete = useCallback((messageId, deleteType) => {
    if (deleteType === 'forEveryone') {
      // Remove message from state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } else if (deleteType === 'forMe') {
      // For "delete for me", we just remove it locally
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  }, []);

  return {
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
  };
};
