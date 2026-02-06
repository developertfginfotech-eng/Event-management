# Chat Feature API Documentation for Frontend Developers

**Version:** 2.0 (New Chat Features)
**Base URL:** `https://event-backend-lqu0.onrender.com`
**Last Updated:** February 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [New APIs - Chat Features](#new-apis---chat-features)
3. [Modified APIs](#modified-apis)
4. [PubNub Integration](#pubnub-integration)
5. [Message Schema](#message-schema)
6. [Implementation Guide](#implementation-guide)
7. [Error Handling](#error-handling)

---

## Overview

### What's New?

This document covers **all newly created chat APIs** for the Event Management System. The chat system supports:

- **Event-based Group Chat**: Real-time messaging within events
- **Direct Messaging (1:1)**: Private conversations between users
- **File Sharing**: Images, documents, PDFs, voice notes
- **Real-time Delivery**: PubNub integration for instant messaging
- **Message History**: Persistent storage in MongoDB
- **Unread Counts**: Track unread messages per event and per user
- **Online Presence**: See who's online in event chats

### Technology Stack

- **Backend**: Node.js + Express + MongoDB
- **Real-time**: PubNub (publish/subscribe)
- **Authentication**: JWT Bearer tokens
- **File Upload**: Multer (10MB limit)

---

## New APIs - Chat Features

### 1. Authentication & Token Management

#### 1.1 Get PubNub Token for Event Chat
**GET** `/api/chat/auth-token`

**Description:** Get PubNub authentication token for event-based group chats. Token grants access to all events the user is assigned to.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "6981f35a75abdaecf610b757",
    "channels": [
      "event-6981f35a75abdaecf610b757",
      "event-6981f35a75abdaecf610b758"
    ],
    "expiresAt": "2024-02-11T10:00:00Z"
  }
}
```

**Usage:**
- Call this endpoint once on app launch or when opening chat
- Use returned token to initialize PubNub client
- Token expires after 24 hours
- Automatically includes all events user is assigned to

---

#### 1.2 Get PubNub Token for Direct Messages
**GET** `/api/chat/dm/auth-token`

**Description:** Get PubNub authentication token for direct messaging. Token grants access to all DM channels with other users.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "6981f35a75abdaecf610b757",
    "expiresAt": "2024-02-11T10:00:00Z"
  }
}
```

**Usage:**
- Call this when user opens direct messages tab
- Use token for DM channel subscriptions
- Channel naming: `dm-{userId1}-{userId2}` (IDs sorted alphabetically)

---

### 2. Event-Based Group Chat

#### 2.1 Send Message to Event Chat
**POST** `/api/chat/events/:eventId/messages`

**Description:** Send a message to an event's group chat. Message is saved to MongoDB and published to PubNub channel.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `eventId` | String | Event ID (MongoDB ObjectId) |

**Request Body:**
```json
{
  "content": "Hello team! Ready for today's event.",
  "messageType": "text"
}
```

**With File Attachment:**
```json
{
  "content": "Check out this schedule",
  "messageType": "image",
  "attachments": [
    {
      "url": "/uploads/chat/1707555600000-schedule.jpg",
      "fileName": "schedule.jpg",
      "fileType": "image/jpeg",
      "fileSize": 245678
    }
  ]
}
```

**Message Types:**
- `text` - Plain text message
- `image` - Image attachment (JPEG, PNG, GIF)
- `file` - Document attachment (PDF, DOC, XLS, etc.)
- `system` - System-generated message (auto-created)

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "6981f35a75abdaecf610b999",
    "chatType": "event",
    "event": "6981f35a75abdaecf610b757",
    "sender": {
      "_id": "6981f35a75abdaecf610b123",
      "name": "John Doe",
      "role": "User",
      "profilePhoto": "/uploads/profiles/john.jpg"
    },
    "content": "Hello team! Ready for today's event.",
    "messageType": "text",
    "attachments": [],
    "pubnubTimetoken": "16075556000000000",
    "readBy": [],
    "createdAt": "2024-02-10T09:00:00Z"
  }
}
```

---

#### 2.2 Get Event Messages (History)
**GET** `/api/chat/events/:eventId/messages`

**Description:** Fetch message history for an event chat with pagination.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `eventId` | String | Event ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Page number |
| `limit` | Number | 50 | Messages per page |

**Example:**
```
GET /api/chat/events/6981f35a75abdaecf610b757/messages?page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "6981f35a75abdaecf610b999",
        "chatType": "event",
        "event": "6981f35a75abdaecf610b757",
        "sender": {
          "_id": "6981f35a75abdaecf610b123",
          "name": "John Doe",
          "role": "User",
          "profilePhoto": "/uploads/profiles/john.jpg"
        },
        "content": "Hello team!",
        "messageType": "text",
        "attachments": [],
        "isDeleted": false,
        "isEdited": false,
        "readBy": [
          {
            "user": "6981f35a75abdaecf610b456",
            "readAt": "2024-02-10T09:05:00Z"
          }
        ],
        "createdAt": "2024-02-10T09:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalMessages": 142,
      "hasMore": true
    }
  }
}
```

---

#### 2.3 Mark Event Messages as Read
**POST** `/api/chat/events/:eventId/messages/mark-read`

**Description:** Mark specific messages as read by the current user.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `eventId` | String | Event ID |

**Request Body:**
```json
{
  "messageIds": [
    "6981f35a75abdaecf610b999",
    "6981f35a75abdaecf610b998",
    "6981f35a75abdaecf610b997"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "markedCount": 3
  }
}
```

---

#### 2.4 Get Event Participants
**GET** `/api/chat/events/:eventId/participants`

**Description:** Get list of all users who can access the event chat (assigned users + admins).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `eventId` | String | Event ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "participants": [
      {
        "_id": "6981f35a75abdaecf610b123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "User",
        "profilePhoto": "/uploads/profiles/john.jpg"
      },
      {
        "_id": "6981f35a75abdaecf610b456",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "Admin",
        "profilePhoto": "/uploads/profiles/jane.jpg"
      }
    ],
    "count": 2
  }
}
```

---

#### 2.5 Get Event Chat Unread Count
**GET** `/api/chat/events/:eventId/unread-count`

**Description:** Get number of unread messages for a specific event.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `eventId` | String | Event ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "eventId": "6981f35a75abdaecf610b757",
    "unreadCount": 5
  }
}
```

---

#### 2.6 Get Total Unread Count (All Events)
**GET** `/api/chat/unread-count`

**Description:** Get total unread messages across all events user has access to.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUnread": 12,
    "byEvent": [
      {
        "eventId": "6981f35a75abdaecf610b757",
        "eventName": "Tech Expo 2024",
        "unreadCount": 5
      },
      {
        "eventId": "6981f35a75abdaecf610b758",
        "eventName": "Product Launch",
        "unreadCount": 7
      }
    ]
  }
}
```

---

### 3. Direct Messaging (1:1 Chat)

#### 3.1 Get Chat Users List
**GET** `/api/chat/users`

**Description:** Get list of all users available for direct messaging (excludes current user).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6981f35a75abdaecf610b123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "User",
      "profilePhoto": "/uploads/profiles/john.jpg"
    },
    {
      "_id": "6981f35a75abdaecf610b456",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "Admin",
      "profilePhoto": "/uploads/profiles/jane.jpg"
    }
  ]
}
```

---

#### 3.2 Send Direct Message
**POST** `/api/chat/dm/:recipientId/messages`

**Description:** Send a direct message to another user.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `recipientId` | String | Recipient User ID |

**Request Body:**
```json
{
  "content": "Hi! Can we discuss the event schedule?",
  "messageType": "text"
}
```

**With Attachment:**
```json
{
  "content": "Here's the updated schedule",
  "messageType": "file",
  "attachments": [
    {
      "url": "/uploads/chat/1707555600000-schedule.pdf",
      "fileName": "schedule.pdf",
      "fileType": "application/pdf",
      "fileSize": 123456
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "6981f35a75abdaecf610b888",
    "chatType": "direct",
    "sender": {
      "_id": "6981f35a75abdaecf610b111",
      "name": "Current User",
      "role": "User"
    },
    "recipient": {
      "_id": "6981f35a75abdaecf610b123",
      "name": "John Doe",
      "role": "User"
    },
    "content": "Hi! Can we discuss the event schedule?",
    "messageType": "text",
    "attachments": [],
    "pubnubTimetoken": "16075556000000000",
    "createdAt": "2024-02-10T09:30:00Z"
  }
}
```

---

#### 3.3 Get Direct Messages (History)
**GET** `/api/chat/dm/:otherUserId/messages`

**Description:** Fetch direct message history with another user.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `otherUserId` | String | Other user's ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Page number |
| `limit` | Number | 50 | Messages per page |

**Example:**
```
GET /api/chat/dm/6981f35a75abdaecf610b123/messages?page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "6981f35a75abdaecf610b888",
        "chatType": "direct",
        "sender": {
          "_id": "6981f35a75abdaecf610b111",
          "name": "Current User"
        },
        "recipient": {
          "_id": "6981f35a75abdaecf610b123",
          "name": "John Doe"
        },
        "content": "Hi! Can we discuss?",
        "messageType": "text",
        "attachments": [],
        "isDeleted": false,
        "readBy": [
          {
            "user": "6981f35a75abdaecf610b123",
            "readAt": "2024-02-10T09:35:00Z"
          }
        ],
        "createdAt": "2024-02-10T09:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalMessages": 78,
      "hasMore": true
    }
  }
}
```

---

#### 3.4 Get DM Unread Count (Total)
**GET** `/api/chat/dm/unread-count`

**Description:** Get total unread direct messages count.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 8
  }
}
```

---

#### 3.5 Get DM Unread Count Per User
**GET** `/api/chat/dm/unread-per-user`

**Description:** Get unread message count for each user conversation.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "6981f35a75abdaecf610b123": {
      "count": 3,
      "lastMessageTime": "2024-02-10T09:30:00Z"
    },
    "6981f35a75abdaecf610b456": {
      "count": 5,
      "lastMessageTime": "2024-02-10T10:15:00Z"
    }
  }
}
```

**Usage:**
- Key is user ID
- Value contains unread count and last message timestamp
- Use to show badges on user list

---

### 4. File Upload for Chat

#### 4.1 Upload Chat File
**POST** `/api/chat/upload`

**Description:** Upload a file for chat (image, document, voice note). Returns file URL to include in message.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Request:** `multipart/form-data`
- **Field name:** `file`
- **Max size:** 10MB
- **Allowed types:**
  - **Images:** `.jpg`, `.jpeg`, `.png`, `.gif`
  - **Documents:** `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.txt`
  - **Audio:** `.mp3`, `.wav`, `.m4a`, `.ogg`, `.webm`

**Example (JavaScript/React Native):**
```javascript
const formData = new FormData();
formData.append('file', {
  uri: fileUri,
  type: 'image/jpeg',
  name: 'photo.jpg'
});

fetch('https://event-backend-lqu0.onrender.com/api/chat/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  // Use data.data.url in message attachments
  console.log(data.data.url);
});
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "/uploads/chat/1707555600000-9876543210-photo.jpg",
    "fileName": "photo.jpg",
    "fileType": "image/jpeg",
    "fileSize": 245678
  }
}
```

**Upload Flow:**
1. Upload file using this endpoint
2. Get file details from response
3. Send message with attachment details:
```json
{
  "content": "Check this out",
  "messageType": "image",
  "attachments": [
    {
      "url": "/uploads/chat/1707555600000-9876543210-photo.jpg",
      "fileName": "photo.jpg",
      "fileType": "image/jpeg",
      "fileSize": 245678
    }
  ]
}
```

---

#### 4.2 Voice Note Recording Flow

**Recording in React Native:**
```javascript
// Start recording
const { recording } = await Audio.Recording.createAsync(
  Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
);

// Stop recording
await recording.stopAndUnloadAsync();
const uri = recording.getURI();

// Upload
const formData = new FormData();
formData.append('file', {
  uri: uri,
  type: 'audio/m4a',
  name: `voice-${Date.now()}.m4a`
});

const response = await fetch('/api/chat/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const { data } = await response.json();

// Send as message
await sendMessage({
  content: "Voice message",
  messageType: "file",
  attachments: [data]
});
```

---

### 5. Message Operations

#### 5.1 Delete Message
**DELETE** `/api/chat/messages/:messageId`

**Description:** Soft delete a message. Only sender or admin can delete.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `messageId` | String | Message ID |

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": {
    "_id": "6981f35a75abdaecf610b999",
    "isDeleted": true,
    "deletedAt": "2024-02-10T10:00:00Z"
  }
}
```

**Note:** Message is soft-deleted (marked as deleted, not removed from database).

---

## Modified APIs

### No Existing APIs Were Modified

All existing APIs in USER_API.md remain unchanged. The chat feature is completely separate and does not modify any existing endpoints or data structures for:

- Authentication
- Dashboard
- Events
- Leads
- Expenses
- Attendance
- Tasks
- File Upload

**Note:** The original `/api/files/upload` endpoint remains unchanged. A new separate endpoint `/api/chat/upload` was created specifically for chat file uploads with different validation rules.

---

## PubNub Integration

### Channel Naming Convention

**Event Channels:**
```
event-{eventId}
```
Example: `event-6981f35a75abdaecf610b757`

**Direct Message Channels:**
```
dm-{userId1}-{userId2}
```
- User IDs are sorted alphabetically
- Example: `dm-6981f35a75abdaecf610b111-6981f35a75abdaecf610b123`

### PubNub Configuration

**Environment Variables (Frontend):**
```javascript
PUBNUB_PUBLISH_KEY=pub-c-be6fb440-465c-4091-82ed-2f108b029127
PUBNUB_SUBSCRIBE_KEY=sub-c-0b7b3050-2b07-4aed-8ef6-d91061f457cf
```

### PubNub Setup (React Native)

**1. Install PubNub:**
```bash
npm install pubnub pubnub-react
```

**2. Initialize PubNub:**
```javascript
import PubNub from 'pubnub';

// Get auth token from backend
const { data } = await fetch('/api/chat/auth-token', {
  headers: { 'Authorization': `Bearer ${jwtToken}` }
}).then(r => r.json());

// Initialize PubNub
const pubnub = new PubNub({
  publishKey: 'pub-c-be6fb440-465c-4091-82ed-2f108b029127',
  subscribeKey: 'sub-c-0b7b3050-2b07-4aed-8ef6-d91061f457cf',
  uuid: data.userId,
  authKey: data.token,
  ssl: true
});
```

**3. Subscribe to Event Channel:**
```javascript
const eventId = '6981f35a75abdaecf610b757';
const channel = `event-${eventId}`;

pubnub.subscribe({ channels: [channel] });

// Listen for messages
pubnub.addListener({
  message: (messageEvent) => {
    console.log('New message:', messageEvent.message);
    // Update UI with new message
  },
  presence: (presenceEvent) => {
    console.log('Presence:', presenceEvent);
    // Update online users list
  }
});
```

**4. Publish Message:**
```javascript
// First save to backend
const response = await fetch(`/api/chat/events/${eventId}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: "Hello team!",
    messageType: "text"
  })
});

const { data: savedMessage } = await response.json();

// Then publish to PubNub for real-time delivery
await pubnub.publish({
  channel: `event-${eventId}`,
  message: savedMessage
});
```

**5. Get Online Users (Presence):**
```javascript
pubnub.hereNow({
  channels: [`event-${eventId}`],
  includeUUIDs: true
}, (status, response) => {
  console.log('Online users:', response.channels[`event-${eventId}`].occupants);
});
```

---

## Message Schema

### Message Object Structure

```typescript
interface Message {
  _id: string;                    // MongoDB ObjectId
  chatType: 'event' | 'direct';   // Chat type
  event?: string;                 // Event ID (for event chats)
  sender: {                       // Sender details
    _id: string;
    name: string;
    role: string;
    profilePhoto?: string;
  };
  recipient?: {                   // Recipient (for DMs only)
    _id: string;
    name: string;
    role: string;
  };
  content: string;                // Message text (max 5000 chars)
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments: Array<{            // File attachments
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }>;
  pubnubTimetoken?: string;       // PubNub timestamp
  isEdited: boolean;              // Message edited flag
  isDeleted: boolean;             // Soft delete flag
  readBy: Array<{                 // Read receipts
    user: string;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Implementation Guide

### Step-by-Step Integration for React Native

#### 1. Setup PubNub Service

Create `services/pubnubService.js`:

```javascript
import PubNub from 'pubnub';

class PubNubService {
  constructor() {
    this.pubnub = null;
    this.listeners = [];
  }

  async initialize(userId, authToken) {
    this.pubnub = new PubNub({
      publishKey: 'pub-c-be6fb440-465c-4091-82ed-2f108b029127',
      subscribeKey: 'sub-c-0b7b3050-2b07-4aed-8ef6-d91061f457cf',
      uuid: userId,
      authKey: authToken,
      ssl: true
    });
  }

  subscribe(channel, messageCallback, presenceCallback) {
    this.pubnub.subscribe({
      channels: [channel],
      withPresence: true
    });

    const listener = {
      message: (event) => {
        if (event.channel === channel) {
          messageCallback(event.message);
        }
      },
      presence: (event) => {
        if (event.channel === channel && presenceCallback) {
          presenceCallback(event);
        }
      }
    };

    this.pubnub.addListener(listener);
    this.listeners.push({ channel, listener });
  }

  unsubscribe(channel) {
    this.pubnub.unsubscribe({ channels: [channel] });
    // Remove listener
  }

  async publish(channel, message) {
    return await this.pubnub.publish({
      channel,
      message
    });
  }

  disconnect() {
    if (this.pubnub) {
      this.pubnub.unsubscribeAll();
      this.pubnub.removeAllListeners();
    }
  }
}

export default new PubNubService();
```

#### 2. Create Chat Hook

Create `hooks/useEventChat.js`:

```javascript
import { useState, useEffect, useCallback } from 'react';
import pubnubService from '../services/pubnubService';
import api from '../services/api';

export const useEventChat = (eventId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!eventId) return;

    const initChat = async () => {
      try {
        // Get PubNub token
        const tokenRes = await api.get('/chat/auth-token');
        await pubnubService.initialize(
          tokenRes.data.data.userId,
          tokenRes.data.data.token
        );

        // Subscribe to channel
        const channel = `event-${eventId}`;
        pubnubService.subscribe(
          channel,
          handleNewMessage,
          handlePresence
        );

        // Load message history
        const messagesRes = await api.get(`/chat/events/${eventId}/messages`);
        setMessages(messagesRes.data.data.messages);
        setLoading(false);
      } catch (error) {
        console.error('Chat init error:', error);
        setLoading(false);
      }
    };

    initChat();

    return () => {
      pubnubService.unsubscribe(`event-${eventId}`);
    };
  }, [eventId]);

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handlePresence = (event) => {
    // Update online users
    console.log('Presence event:', event);
  };

  const sendMessage = useCallback(async (text, attachments = []) => {
    try {
      const res = await api.post(`/chat/events/${eventId}/messages`, {
        content: text,
        messageType: attachments.length > 0 ? 'image' : 'text',
        attachments
      });
      // Message will arrive via PubNub subscription
      return res.data.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }, [eventId]);

  return {
    messages,
    loading,
    onlineUsers,
    sendMessage
  };
};
```

#### 3. Create Chat Screen

```javascript
import React, { useState } from 'react';
import { View, FlatList, TextInput, Button } from 'react-native';
import { useEventChat } from '../hooks/useEventChat';
import MessageBubble from '../components/MessageBubble';

const EventChatScreen = ({ route }) => {
  const { eventId } = route.params;
  const { messages, loading, sendMessage } = useEventChat(eventId);
  const [inputText, setInputText] = useState('');

  const handleSend = async () => {
    if (inputText.trim()) {
      await sendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={item => item._id}
        renderItem={({ item }) => <MessageBubble message={item} />}
      />
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          style={{ flex: 1, borderWidth: 1, borderRadius: 20, padding: 10 }}
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </View>
  );
};

export default EventChatScreen;
```

#### 4. File Upload Example

```javascript
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8
  });

  if (!result.canceled) {
    const file = result.assets[0];
    await uploadAndSend(file);
  }
};

const uploadAndSend = async (file) => {
  // Upload file
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type || 'image/jpeg',
    name: file.fileName || 'image.jpg'
  });

  const uploadRes = await fetch(`${API_URL}/api/chat/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  const uploadData = await uploadRes.json();

  // Send message with attachment
  await sendMessage('', [uploadData.data]);
};
```

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```
**Solution:** Check JWT token, re-login if expired

#### 403 Forbidden (Event Access)
```json
{
  "success": false,
  "message": "You are not assigned to this event"
}
```
**Solution:** User doesn't have access to event chat

#### 403 Forbidden (PubNub)
```
PubNub Access Denied (403)
```
**Solution:** Fetch new PubNub token from `/api/chat/auth-token`

#### 404 Not Found
```json
{
  "success": false,
  "message": "Event not found"
}
```
**Solution:** Verify event ID is valid

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Content is required"
}
```
**Solution:** Check request body format

#### 413 Payload Too Large
```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB"
}
```
**Solution:** Compress file or inform user

### Error Handling Best Practices

```javascript
const sendMessage = async (text) => {
  try {
    const response = await api.post(`/chat/events/${eventId}/messages`, {
      content: text,
      messageType: 'text'
    });
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      Alert.alert('Session expired', 'Please login again');
      navigation.navigate('Login');
    } else if (error.response?.status === 403) {
      // No access
      Alert.alert('Access denied', 'You cannot access this chat');
    } else {
      // Generic error
      Alert.alert('Error', error.response?.data?.message || 'Failed to send message');
    }
    throw error;
  }
};
```

---

## Testing Guide

### Testing Checklist

#### Event Chat
- [ ] Get PubNub token successfully
- [ ] Subscribe to event channel
- [ ] Send text message
- [ ] Receive real-time messages from other users
- [ ] Load message history with pagination
- [ ] Mark messages as read
- [ ] Upload and send image
- [ ] Upload and send document
- [ ] Record and send voice note
- [ ] See online users count
- [ ] See unread count badge
- [ ] Delete own message

#### Direct Messaging
- [ ] Get chat users list
- [ ] Send DM to another user
- [ ] Receive DM in real-time
- [ ] Load DM history
- [ ] See per-user unread counts
- [ ] Send file in DM

#### Edge Cases
- [ ] Handle network disconnection
- [ ] Reconnect to PubNub after network restored
- [ ] Handle token expiration
- [ ] Handle file upload failure
- [ ] Show deleted messages as "[Message deleted]"

---

## Support & Contact

For questions or issues with the Chat API:
- **Backend Developer:** [Your Contact]
- **Documentation:** This file
- **PubNub Docs:** https://www.pubnub.com/docs/

---

**End of Chat API Documentation**
