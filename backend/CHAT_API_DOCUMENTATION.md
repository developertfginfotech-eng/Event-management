**Base URL:** `https://event-backend-lqu0.onrender.com`

## 📋 Table of Contents

1. [Overview](#overview)
2. [New APIs - Chat Features](#new-apis---chat-features)
3. [Modified APIs](#modified-apis)
4. [PubNub Integration](#pubnub-integration)
5. [Message Schema](#message-schema)
6. [Implementation Guide](#implementation-guide)
7. [Error Handling](#error-handling)



- **Event-based Group Chat**: Real-time messaging within events
- **Direct Messaging (1:1)**: Private conversations between users
- **File Sharing**: Images, documents, PDFs, voice notes
- **Delete Messages**: WhatsApp-style "Delete for me" and "Delete for everyone"
- **Real-time Delivery**: PubNub integration for instant messaging
- **Message History**: Persistent storage in MongoDB
- **Unread Counts**: Track unread messages per event and per user
- **Online Presence**: See who's online in event chats
- **WhatsApp-Style UI**: Full-screen split-pane chat interface

### Technology Stack

- **Backend**: Node.js + Express + MongoDB
- **Real-time**: PubNub (publish/subscribe)
- **Authentication**: JWT Bearer tokens
- **File Upload**: Multer (10MB limit)

---

## New APIs - Chat Features

### 1. Authentication & Token Management

#### 1.1 Get PubNub Token for Event Chat
**GET** `https://event-backend-lqu0.onrender.com/api/chat/auth-token`

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
**GET** `https://event-backend-lqu0.onrender.com/api/chat/dm/auth-token`

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
**POST** `https://event-backend-lqu0.onrender.com/api/chat/events/:eventId/messages`

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
**GET** `https://event-backend-lqu0.onrender.com/api/chat/events/:eventId/messages`

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
GET https://event-backend-lqu0.onrender.com/api/chat/events/6981f35a75abdaecf610b757/messages?page=1&limit=50
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
**POST** `https://event-backend-lqu0.onrender.com/api/chat/events/:eventId/messages/mark-read`

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
**GET** `https://event-backend-lqu0.onrender.com/api/chat/events/:eventId/participants`

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
**GET** `https://event-backend-lqu0.onrender.com/api/chat/events/:eventId/unread-count`

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
**GET** `https://event-backend-lqu0.onrender.com/api/chat/unread-count`

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
**GET** `https://event-backend-lqu0.onrender.com/api/chat/users`

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
**POST** `https://event-backend-lqu0.onrender.com/api/chat/dm/:recipientId/messages`

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
**GET** `https://event-backend-lqu0.onrender.com/api/chat/dm/:otherUserId/messages`

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
GET https://event-backend-lqu0.onrender.com/api/chat/dm/6981f35a75abdaecf610b123/messages?page=1&limit=50
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
**GET** `https://event-backend-lqu0.onrender.com/api/chat/dm/unread-count`

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
**GET** `https://event-backend-lqu0.onrender.com/api/chat/dm/unread-per-user`

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
**POST** `https://event-backend-lqu0.onrender.com/api/chat/upload`

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
**DELETE** `https://event-backend-lqu0.onrender.com/api/chat/messages/:messageId`

**Description:** Delete a message with two options - "Delete for me" or "Delete for everyone" (WhatsApp-style).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `messageId` | String | Message ID |

**Request Body:**
```json
{
  "deleteType": "forMe"
}
```

**Delete Types:**
- `forMe` - Message deleted only for current user (anyone can do this)
- `forEveryone` - Message deleted for all users (only sender or admin)

**Response (Delete for Me):**
```json
{
  "success": true,
  "message": "Message deleted for you",
  "data": {
    "deleteType": "forMe",
    "messageId": "6981f35a75abdaecf610b999"
  }
}
```

**Response (Delete for Everyone):**
```json
{
  "success": true,
  "message": "Message deleted for everyone",
  "data": {
    "deleteType": "forEveryone",
    "messageId": "6981f35a75abdaecf610b999"
  }
}
```

**PubNub Real-time Event (Delete for Everyone):**
```json
{
  "type": "message_deleted",
  "messageId": "6981f35a75abdaecf610b999",
  "deletedBy": "6981f35a75abdaecf610b111",
  "deleteType": "forEveryone",
  "timestamp": "2024-02-10T10:00:00Z"
}
```

**Error Response (Not Authorized):**
```json
{
  "success": false,
  "message": "Only the sender or admin can delete for everyone"
}
```

**Notes:**
- **Delete for Me**: Adds user to `deletedFor` array, message hidden only for that user
- **Delete for Everyone**: Sets `isDeleted: true`, message hidden for all users
- Real-time notification sent via PubNub for "delete for everyone"
- Message filtering happens automatically in message history APIs

---
