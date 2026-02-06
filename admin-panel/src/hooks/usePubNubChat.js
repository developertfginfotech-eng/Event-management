import { useState, useEffect, useCallback, useRef } from 'react';
import pubnubService from '../services/pubnubService';
import { getChatToken, getEventMessages, sendChatMessage } from '../services/api';

export const usePubNubChat = (eventId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const initializedRef = useRef(false);
  const messagesEndRef = useRef(null);

  // Initialize PubNub and fetch initial messages
  useEffect(() => {
    if (!eventId || initializedRef.current) return;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError('');

        // Get current user
        const user = JSON.parse(localStorage.getItem('user') || '{}');
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
        const initialMessages = messagesResponse.data.data.map(msg => ({
          id: msg._id,
          user: {
            id: msg.sender?._id,
            name: msg.sender?.name || 'System',
            role: msg.sender?.role,
            avatar: msg.sender?.name?.[0] || 'S'
          },
          text: msg.content,
          timestamp: new Date(msg.createdAt),
          isOwn: msg.sender?._id === user._id,
          messageType: msg.messageType || 'text',
          attachments: msg.attachments || []
        }));

        setMessages(initialMessages.reverse());

        // Subscribe to PubNub channel
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
        pubnubService.unsubscribe(eventId);
        initializedRef.current = false;
      }
    };
  }, [eventId]);

  // Handle incoming PubNub message
  const handleIncomingMessage = useCallback((message) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Handle different message types
    if (message.type === 'message_deleted') {
      // Remove deleted message
      setMessages(prev => prev.filter(msg => msg.id !== message.messageId));
      return;
    }

    // Regular chat message
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
      isOwn: message.sender.id === user._id,
      messageType: message.messageType || 'text',
      attachments: message.attachments || []
    };

    setMessages(prev => {
      // Avoid duplicates
      if (prev.some(msg => msg.id === newMessage.id)) {
        return prev;
      }
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

      const user = JSON.parse(localStorage.getItem('user') || '{}');

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

      const olderMessages = messagesResponse.data.data.map(msg => ({
        id: msg._id,
        user: {
          id: msg.sender?._id,
          name: msg.sender?.name || 'System',
          role: msg.sender?.role,
          avatar: msg.sender?.name?.[0] || 'S'
        },
        text: msg.content,
        timestamp: new Date(msg.createdAt),
        isOwn: msg.sender?._id === JSON.parse(localStorage.getItem('user') || '{}')._id,
        messageType: msg.messageType || 'text',
        attachments: msg.attachments || []
      }));

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

  return {
    messages,
    sendMessage,
    loadMore,
    isConnected,
    onlineUsers,
    error,
    loading,
    sending,
    messagesEndRef
  };
};
