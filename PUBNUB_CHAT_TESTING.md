# PubNub Chat Testing Guide

## ✅ Implementation Complete!

All PubNub chat integration code has been successfully implemented.

---

## 🔧 Before Testing: Enable Access Manager

**CRITICAL STEP** - You must enable Access Manager in PubNub dashboard:

1. Go to https://admin.pubnub.com/
2. Select your "Event-management" app
3. Click on "event-management" keyset
4. Scroll to "Access Manager" section
5. Click "Enable Access Manager"
6. **This is required for token authentication to work!**

---

## 🚀 How to Test

### Step 1: Start Backend Server

```bash
cd /Users/barshatfg/Downloads/event-management/backend
npm run dev
```

**Expected output:**
```
Server running on port 5003
Connected to MongoDB
```

### Step 2: Start Frontend Server

```bash
cd /Users/barshatfg/Downloads/event-management/admin-panel
npm run dev
```

**Expected output:**
```
VITE v5.0.8  ready in XXX ms
➜  Local:   http://localhost:3005/
```

### Step 3: Test Chat Functionality

#### 3.1 Login to Admin Panel
- Open browser: http://localhost:3005
- Login with your credentials

#### 3.2 Navigate to Event Details
- Click "Events" in sidebar
- Click on any event to view details
- You should see a "💬 Open Chat" button in the header

#### 3.3 Open Chat
- Click "💬 Open Chat" button
- Chat sidebar should slide in from the right
- You should see "Connecting to chat..." message
- After a moment, it should show "Connected" with online count

#### 3.4 Send Test Message
- Type a message in the input box at the bottom
- Press Enter or click the send button (➤)
- Message should appear in the chat with your name

#### 3.5 Test Real-Time Messaging (Multiple Users)
- Open another browser (or incognito window)
- Login as a different user
- Navigate to the same event
- Open chat
- Send messages from both users
- **Both users should see messages in real-time!**

---

## 🔍 What to Check

### Backend Endpoints
Test these endpoints in your browser console or Postman:

```javascript
// Get PubNub token
GET http://localhost:5003/api/chat/auth-token
Headers: Authorization: Bearer <your-jwt-token>

// Send message
POST http://localhost:5003/api/chat/events/<event-id>/messages
Headers: Authorization: Bearer <your-jwt-token>
Body: { "content": "Hello from API test" }

// Get messages
GET http://localhost:5003/api/chat/events/<event-id>/messages
Headers: Authorization: Bearer <your-jwt-token>
```

### Frontend Console
Open browser DevTools (F12) and check for:

✅ **Success indicators:**
- "PubNub initialized for user: <user-id>"
- "Subscribed to channel: event-<event-id>"
- No errors in console

❌ **Error indicators:**
- "PubNub connection failed"
- "403 Forbidden" - Check if Access Manager is enabled
- "Token expired" - Backend should generate new token

---

## 🐛 Troubleshooting

### Issue: "Failed to connect to chat"
**Solutions:**
1. Check backend is running on port 5003
2. Verify PubNub keys are in backend `.env` file
3. Check browser console for specific errors

### Issue: "403 Access Denied" or token errors
**Solutions:**
1. **Enable Access Manager in PubNub dashboard** (most common issue!)
2. Verify user is assigned to the event
3. Check JWT token is valid (not expired)
4. Restart backend server after enabling Access Manager

### Issue: Messages not appearing
**Solutions:**
1. Check PubNub subscription succeeded (console log)
2. Verify channel name format: `event-<eventId>`
3. Check both users are in the same event
4. Refresh the page and try again

### Issue: "PubNub not initialized"
**Solutions:**
1. Check frontend .env has VITE_PUBNUB_PUBLISH_KEY and VITE_PUBNUB_SUBSCRIBE_KEY
2. Verify keys match your PubNub dashboard
3. Restart frontend dev server (`npm run dev`)

---

## ✨ Features Implemented

### Backend (Express API):
- ✅ PubNub configuration and token generation
- ✅ Message model with MongoDB storage
- ✅ Chat controller with 8 endpoints
- ✅ Access control (users can only access assigned events)
- ✅ Message history with pagination
- ✅ Unread count tracking
- ✅ Soft delete for messages

### Frontend (React):
- ✅ PubNub service for real-time messaging
- ✅ Custom hook (usePubNubChat) for state management
- ✅ EventChat component with 5 sub-components
- ✅ Real-time message display
- ✅ Online presence indicators
- ✅ Message history loading
- ✅ Auto-scroll to latest message
- ✅ Responsive design

---

## 📝 API Endpoints Available

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/auth-token` | Get PubNub authentication token |
| POST | `/api/chat/events/:eventId/messages` | Send a message |
| GET | `/api/chat/events/:eventId/messages` | Get message history |
| POST | `/api/chat/events/:eventId/messages/mark-read` | Mark messages as read |
| GET | `/api/chat/unread-count` | Get total unread count |
| GET | `/api/chat/events/:eventId/unread-count` | Get unread count for event |
| DELETE | `/api/chat/messages/:messageId` | Delete a message |
| GET | `/api/chat/events/:eventId/participants` | Get chat participants |

---

## 🎯 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend builds and runs without errors
- [ ] Access Manager enabled in PubNub dashboard
- [ ] Can login to admin panel
- [ ] Can open event details page
- [ ] "Open Chat" button appears in header
- [ ] Chat sidebar opens when button clicked
- [ ] Chat shows "Connected" status
- [ ] Can type and send messages
- [ ] Messages appear in chat instantly
- [ ] Messages persist (visible after refresh)
- [ ] Can test with 2 users simultaneously
- [ ] Real-time messaging works between users
- [ ] Online user count updates
- [ ] Chat can be closed with close button

---

## 🌐 For React Native Mobile App

The backend is ready for mobile app integration! Your frontend developer can:

1. Install PubNub SDK for React Native:
```bash
npm install pubnub pubnub-react
```

2. Use the same backend API endpoints
3. Call `/api/chat/auth-token` to get PubNub credentials
4. Subscribe to the same channels (`event-{eventId}`)
5. Messages will sync in real-time between web and mobile!

---

## 📊 Next Steps (Optional Enhancements)

1. **File Attachments** - Support images and documents in chat
2. **Typing Indicators** - Show when users are typing
3. **Read Receipts** - Show who read each message
4. **@Mentions** - Notify specific users
5. **Message Reactions** - Add emoji reactions
6. **Push Notifications** - Browser notifications for new messages
7. **Message Search** - Search chat history
8. **Export Chat** - Download chat as PDF/CSV

---

## 🔒 Security Notes

- ✅ JWT authentication required for all endpoints
- ✅ Users can only access chats for events they're assigned to
- ✅ Admins can access all event chats
- ✅ PubNub tokens expire after 24 hours (auto-refresh)
- ✅ Message content limited to 5000 characters
- ✅ Soft delete preserves message history for auditing
- ✅ All messages stored in MongoDB for compliance

---

## 📦 Files Created/Modified

### Backend (7 files):
- `/backend/.env` - Added PubNub keys
- `/backend/config/pubnub.js` - **New** - PubNub configuration
- `/backend/models/Message.js` - **New** - Message schema
- `/backend/controllers/chatController.js` - **New** - Chat logic
- `/backend/routes/chatRoutes.js` - **Modified** - Chat routes

### Frontend (13 files):
- `/admin-panel/.env` - Added PubNub keys
- `/admin-panel/src/services/api.js` - **Modified** - Added chat APIs
- `/admin-panel/src/services/pubnubService.js` - **New** - PubNub service
- `/admin-panel/src/hooks/usePubNubChat.js` - **New** - Chat hook
- `/admin-panel/src/components/EventChat/EventChat.jsx` - **New**
- `/admin-panel/src/components/EventChat/ChatHeader.jsx` - **New**
- `/admin-panel/src/components/EventChat/ChatMessages.jsx` - **New**
- `/admin-panel/src/components/EventChat/MessageBubble.jsx` - **New**
- `/admin-panel/src/components/EventChat/ChatInput.jsx` - **New**
- `/admin-panel/src/components/EventChat/EventChat.css` - **New**
- `/admin-panel/src/pages/EventDetails.jsx` - **Modified** - Integrated chat
- `/admin-panel/src/pages/EventDetails.css` - **Modified** - Chat layout

---

## 🎉 Success!

Your PubNub chat integration is complete and ready to test!

**Important:** Remember to enable Access Manager in PubNub dashboard before testing!

Happy chatting! 💬✨
