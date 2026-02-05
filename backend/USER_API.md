# Event Management System - Mobile App API Documentation

**Version:** 1.0
**Base URL:** `https://event-backend-lqu0.onrender.com`

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Dashboard](#dashboard)
4. [Events Management](#events-management)
5. [Leads Management](#leads-management)
6. [Expenses Management](#expenses-management)
7. [Attendance Management](#attendance-management)
8. [Tasks Management](#tasks-management)
9. [File Upload](#file-upload)
10. [Response Codes](#response-codes)
11. [API Reference Table](#api-reference-table)

---

## Getting Started

### Base URL
```
https://event-backend-lqu0.onrender.com
```

### Authentication
All endpoints (except login) require Bearer token:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Quick Start
1. Login to get authentication token
2. Use token in all subsequent requests
3. Token is returned in login response

---

## 1. Authentication

### 1.1 Login
**POST** `https://event-backend-lqu0.onrender.com/api/auth/login`

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "password": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "USER_ID",
    "name": "John Doe",
    "email": "user@gmail.com",
    "phone": "+1234567890",
    "role": "User",
    "permissions": {
      "canCreateLeads": true,
      "canViewAllLeads": false,
      "canApproveExpenses": false,
      "canViewReports": false
    }
  }
}
```

---

### 1.2 Get Current User Profile
**GET** `https://event-backend-lqu0.onrender.com/api/auth/me`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "USER_ID",
    "name": "John Doe",
    "email": "user@gmail.com",
    "phone": "+1234567890",
    "role": "User",
    "permissions": {
      "canCreateLeads": true,
      "canViewAllLeads": false,
      "canApproveExpenses": false,
      "canViewReports": false
    },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 1.3 Update Profile
**PUT** `https://event-backend-lqu0.onrender.com/api/auth/updatedetails`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "newemail@gmail.com",
  "phone": "+9876543210"
}
```

**Note:** All fields are optional. Send only fields you want to update.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "USER_ID",
    "name": "John Updated",
    "email": "newemail@gmail.com",
    "phone": "+9876543210",
    "role": "User",
    "permissions": {...}
  }
}
```

---

### 1.4 Change Password
**PUT** `https://event-backend-lqu0.onrender.com/api/auth/updatepassword`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "currentPassword": "user123",
  "newPassword": "newpass123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "USER_ID",
    "name": "John Doe",
    "email": "user@gmail.com",
    "role": "User"
  }
}
```

**Note:** New token is returned. Update your stored token.

---

## 2. Dashboard

### 2.1 Get User Dashboard
**GET** `https://event-backend-lqu0.onrender.com/api/dashboard/user`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "data": {
    "events": {
      "assigned": [
        {
          "_id": "EVENT_ID",
          "name": "Tech Expo 2024",
          "startDate": "2024-02-10T00:00:00Z",
          "endDate": "2024-02-12T00:00:00Z",
          "status": "Upcoming",
          "location": {
            "city": "Delhi",
            "venue": "India Gate"
          }
        }
      ],
      "count": 3
    },
    "leads": {
      "total": 25,
      "new": 10,
      "converted": 5
    },
    "tasks": {
      "pending": 8,
      "recent": [...]
    },
    "expenses": [
      {
        "_id": "Pending",
        "totalAmount": 5000,
        "count": 3
      }
    ],
    "attendance": {
      "today": {...}
    }
  }
}
```

**Note:** `attendance.today` is `null` if user hasn't checked in today.

---

## 3. Events Management

### 3.1 Get All Events
**GET** `https://event-backend-lqu0.onrender.com/api/events`

**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | String | `Upcoming`, `Live`, `Completed` |
| `search` | String | Search by name/location |

**Examples:**
```
GET https://event-backend-lqu0.onrender.com/api/events
GET https://event-backend-lqu0.onrender.com/api/events?status=Upcoming
GET https://event-backend-lqu0.onrender.com/api/events?search=Tech
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "EVENT_ID",
      "name": "Tech Expo 2024",
      "description": "Annual technology exhibition",
      "startDate": "2024-02-10T00:00:00Z",
      "endDate": "2024-02-12T00:00:00Z",
      "status": "Upcoming",
      "location": {
        "city": "Delhi",
        "state": "Delhi",
        "venue": "India Gate"
      },
      "budget": 500000,
      "assignedUsers": [...],
      "createdBy": {...}
    }
  ]
}
```

---

### 3.2 Get Single Event
**GET** `https://event-backend-lqu0.onrender.com/api/events/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Event ID (MongoDB ObjectId) |

**Example:**
```
GET https://event-backend-lqu0.onrender.com/api/events/6981f35a75abdaecf610b757
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "EVENT_ID",
    "name": "Tech Expo 2024",
    "description": "Annual technology exhibition",
    "startDate": "2024-02-10T00:00:00Z",
    "endDate": "2024-02-12T00:00:00Z",
    "status": "Upcoming",
    "location": {...},
    "budget": 500000,
    "assignedUsers": [...],
    "createdBy": {...}
  }
}
```

---

## 4. Leads Management

### 4.1 Get All My Leads
**GET** `https://event-backend-lqu0.onrender.com/api/leads`

**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `source` | String | Filter by event ID |
| `status` | String | `New`, `Contacted`, `Follow-up`, `Qualified`, `Converted`, `Lost` |
| `priority` | String | `High`, `Medium`, `Low` |
| `search` | String | Search in name/company/email |

**Examples:**
```
GET https://event-backend-lqu0.onrender.com/api/leads
GET https://event-backend-lqu0.onrender.com/api/leads?source=EVENT_ID
GET https://event-backend-lqu0.onrender.com/api/leads?status=New&priority=High
GET https://event-backend-lqu0.onrender.com/api/leads?search=john
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "LEAD_ID",
      "name": "John Smith",
      "company": "ABC Corp",
      "phone": "+1234567890",
      "email": "john@abc.com",
      "designation": "Manager",
      "source": {
        "_id": "EVENT_ID",
        "name": "Tech Expo 2024"
      },
      "status": "New",
      "priority": "High",
      "assignedTo": {...},
      "createdBy": {...},
      "createdAt": "2024-02-05T10:00:00Z"
    }
  ]
}
```

---

### 4.2 Get Single Lead
**GET** `https://event-backend-lqu0.onrender.com/api/leads/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Lead ID (MongoDB ObjectId) |

**Example:**
```
GET https://event-backend-lqu0.onrender.com/api/leads/6981f35a75abdaecf610b757
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "LEAD_ID",
    "name": "John Smith",
    "company": "ABC Corp",
    "phone": "+1234567890",
    "email": "john@abc.com",
    "designation": "Manager",
    "source": {...},
    "status": "New",
    "priority": "High",
    "notes": [
      {
        "_id": "NOTE_ID",
        "content": "Initial contact made",
        "createdBy": {...},
        "createdAt": "2024-02-05T11:00:00Z"
      }
    ],
    "communications": [
      {
        "_id": "COMM_ID",
        "type": "Call",
        "notes": "Discussed product features",
        "createdBy": {...},
        "createdAt": "2024-02-05T12:00:00Z"
      }
    ]
  }
}
```

---

### 4.3 Create Lead
**POST** `https://event-backend-lqu0.onrender.com/api/leads`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "name": "John Smith",
  "company": "ABC Corp",
  "phone": "+1234567890",
  "email": "john@abc.com",
  "designation": "Manager",
  "source": "EVENT_ID",
  "priority": "High",
  "status": "New"
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Lead name |
| `company` | String | Company name |
| `phone` | String | Phone number |
| `source` | String | Event ID (MongoDB ObjectId) |

**Optional Fields:**
| Field | Type | Default |
|-------|------|---------|
| `email` | String | - |
| `designation` | String | - |
| `priority` | String | `Medium` |
| `status` | String | `New` |

**Response:**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "_id": "LEAD_ID",
    "name": "John Smith",
    "company": "ABC Corp",
    "phone": "+1234567890",
    "source": "EVENT_ID",
    "status": "New",
    "priority": "High",
    "createdAt": "2024-02-05T10:00:00Z"
  }
}
```

---

### 4.4 Update Lead
**PUT** `https://event-backend-lqu0.onrender.com/api/leads/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Lead ID |

**Request Body:**
```json
{
  "status": "Contacted",
  "priority": "Medium",
  "email": "newemail@abc.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "_id": "LEAD_ID",
    "status": "Contacted",
    "priority": "Medium",
    "email": "newemail@abc.com",
    "updatedAt": "2024-02-05T11:00:00Z"
  }
}
```

---

### 4.5 Delete Lead
**DELETE** `https://event-backend-lqu0.onrender.com/api/leads/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Lead ID |

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully",
  "data": {}
}
```

---

### 4.6 Add Note to Lead
**POST** `https://event-backend-lqu0.onrender.com/api/leads/:id/notes`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Lead ID |

**Request Body:**
```json
{
  "content": "Follow-up scheduled for next week"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "_id": "LEAD_ID",
    "notes": [
      {
        "_id": "NOTE_ID",
        "content": "Follow-up scheduled for next week",
        "createdBy": {...},
        "createdAt": "2024-02-05T11:00:00Z"
      }
    ]
  }
}
```

---

### 4.7 Add Communication to Lead
**POST** `https://event-backend-lqu0.onrender.com/api/leads/:id/communications`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Lead ID |

**Request Body:**
```json
{
  "type": "Call",
  "notes": "Discussed pricing and delivery timelines"
}
```

**Communication Types:** `Call`, `Email`, `Meeting`, `Other`

**Response:**
```json
{
  "success": true,
  "message": "Communication added successfully",
  "data": {
    "_id": "LEAD_ID",
    "communications": [
      {
        "_id": "COMM_ID",
        "type": "Call",
        "notes": "Discussed pricing and delivery timelines",
        "createdBy": {...},
        "createdAt": "2024-02-05T12:00:00Z"
      }
    ]
  }
}
```

---

## 5. Expenses Management

### 5.1 Get All My Expenses
**GET** `https://event-backend-lqu0.onrender.com/api/expenses`

**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | String | Filter by event ID |
| `status` | String | `Pending`, `Approved`, `Rejected` |
| `category` | String | `Travel`, `Food`, `Stay`, `Misc` |

**Examples:**
```
GET https://event-backend-lqu0.onrender.com/api/expenses
GET https://event-backend-lqu0.onrender.com/api/expenses?event=EVENT_ID
GET https://event-backend-lqu0.onrender.com/api/expenses?status=Approved
GET https://event-backend-lqu0.onrender.com/api/expenses?event=EVENT_ID&category=Travel
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "EXPENSE_ID",
      "user": {...},
      "event": {...},
      "category": "Travel",
      "subCategory": "Flight",
      "description": "Flight tickets to Delhi",
      "amount": 5000,
      "date": "2024-02-10T00:00:00Z",
      "receipt": "/uploads/receipts/receipt.jpg",
      "paymentMethod": "Credit Card",
      "status": "Pending",
      "createdAt": "2024-02-05T10:00:00Z"
    }
  ]
}
```

---

### 5.2 Get Single Expense
**GET** `https://event-backend-lqu0.onrender.com/api/expenses/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Expense ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "EXPENSE_ID",
    "user": {...},
    "event": {...},
    "category": "Travel",
    "subCategory": "Flight",
    "description": "Flight tickets to Delhi",
    "amount": 5000,
    "date": "2024-02-10T00:00:00Z",
    "receipt": "/uploads/receipts/receipt.jpg",
    "paymentMethod": "Credit Card",
    "status": "Approved",
    "approvedBy": {...},
    "approvedAt": "2024-02-11T10:00:00Z",
    "adminComments": "Approved as per policy"
  }
}
```

---

### 5.3 Create Expense
**POST** `https://event-backend-lqu0.onrender.com/api/expenses`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "event": "EVENT_ID",
  "category": "Travel",
  "subCategory": "Flight",
  "description": "Flight tickets to Delhi",
  "amount": 5000,
  "date": "2024-02-10",
  "receipt": "/uploads/receipts/receipt-1707132000000.jpg",
  "paymentMethod": "Credit Card"
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `event` | String | Event ID (MongoDB ObjectId) |
| `category` | String | `Travel`, `Food`, `Stay`, `Misc` |
| `description` | String | Expense description |
| `amount` | Number | Amount in rupees |
| `date` | String | Date (YYYY-MM-DD) |

**Optional Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `subCategory` | String | Sub-category name |
| `receipt` | String | File path from file upload API |
| `paymentMethod` | String | Payment method used |

**Response:**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "_id": "EXPENSE_ID",
    "event": "EVENT_ID",
    "category": "Travel",
    "amount": 5000,
    "status": "Pending",
    "createdAt": "2024-02-05T10:00:00Z"
  }
}
```

**Note:** Upload receipt first using File Upload API, then use returned path.

---

### 5.4 Update Expense
**PUT** `https://event-backend-lqu0.onrender.com/api/expenses/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Expense ID |

**Request Body:**
```json
{
  "description": "Updated description",
  "amount": 5500
}
```

**Note:** Can only update expenses with `Pending` status.

**Response:**
```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "_id": "EXPENSE_ID",
    "description": "Updated description",
    "amount": 5500,
    "updatedAt": "2024-02-05T11:00:00Z"
  }
}
```

---

### 5.5 Delete Expense
**DELETE** `https://event-backend-lqu0.onrender.com/api/expenses/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Expense ID |

**Note:** Can only delete expenses with `Pending` status.

**Response:**
```json
{
  "success": true,
  "message": "Expense deleted successfully",
  "data": {}
}
```

---

### 5.6 Get Expense Summary
**GET** `https://event-backend-lqu0.onrender.com/api/expenses/summary/:eventId`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `eventId` | String | Event ID (MongoDB ObjectId) |

**Example:**
```
GET https://event-backend-lqu0.onrender.com/api/expenses/summary/6981f35a75abdaecf610b757
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 25000,
    "pending": 5000,
    "approved": 18000,
    "rejected": 2000,
    "count": 12,
    "byCategory": [
      {
        "_id": "Travel",
        "total": 15000
      },
      {
        "_id": "Food",
        "total": 8000
      }
    ]
  }
}
```

---

## 6. Attendance Management

### 6.1 Get All My Attendance
**GET** `https://event-backend-lqu0.onrender.com/api/attendance`

**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | String | Filter by event ID |
| `status` | String | `Present`, `Absent`, `Half Day`, `Leave` |
| `startDate` | String | Filter from date (YYYY-MM-DD) |
| `endDate` | String | Filter to date (YYYY-MM-DD) |

**Examples:**
```
GET https://event-backend-lqu0.onrender.com/api/attendance
GET https://event-backend-lqu0.onrender.com/api/attendance?event=EVENT_ID
GET https://event-backend-lqu0.onrender.com/api/attendance?status=Present
GET https://event-backend-lqu0.onrender.com/api/attendance?startDate=2024-02-01&endDate=2024-02-28
```

**Response:**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "_id": "ATTENDANCE_ID",
      "user": {...},
      "event": {...},
      "date": "2024-02-10T00:00:00Z",
      "checkIn": {
        "time": "2024-02-10T09:00:00Z",
        "location": {
          "latitude": 28.7041,
          "longitude": 77.1025,
          "address": "India Gate, Delhi"
        },
        "selfie": "/uploads/selfies/selfie.jpg"
      },
      "checkOut": {
        "time": "2024-02-10T18:00:00Z",
        "location": {...}
      },
      "workHours": 9,
      "status": "Present"
    }
  ]
}
```

---

### 6.2 Get Single Attendance Record
**GET** `https://event-backend-lqu0.onrender.com/api/attendance/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Attendance record ID (MongoDB ObjectId) |

**Example:**
```
GET https://event-backend-lqu0.onrender.com/api/attendance/6981f35a75abdaecf610b757
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ATTENDANCE_ID",
    "user": {...},
    "event": {...},
    "date": "2024-02-10T00:00:00Z",
    "checkIn": {...},
    "checkOut": {...},
    "workHours": 9,
    "status": "Present"
  }
}
```

---

### 6.3 Check-In
**POST** `https://event-backend-lqu0.onrender.com/api/attendance/check-in`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "event": "EVENT_ID",
  "location": {
    "latitude": 28.7041,
    "longitude": 77.1025,
    "address": "India Gate, Delhi"
  },
  "selfie": "/uploads/selfies/selfie-1707555600000.jpg"
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `event` | String | Event ID (MongoDB ObjectId) |
| `location.latitude` | Number | GPS latitude |
| `location.longitude` | Number | GPS longitude |

**Optional Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `location.address` | String | GPS reverse geocoded address |
| `selfie` | String | File path from file upload API |

**Response:**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "_id": "ATTENDANCE_ID",
    "user": "USER_ID",
    "event": "EVENT_ID",
    "date": "2024-02-10T00:00:00Z",
    "checkIn": {
      "time": "2024-02-10T09:00:00Z",
      "location": {...},
      "selfie": "/uploads/selfies/selfie.jpg"
    },
    "status": "Present"
  }
}
```

**Note:**
- GPS coordinates come from mobile device location services
- Upload selfie first using File Upload API
- Address field is optional

---

### 6.4 Check-Out
**POST** `https://event-backend-lqu0.onrender.com/api/attendance/check-out`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "event": "EVENT_ID",
  "location": {
    "latitude": 28.7041,
    "longitude": 77.1025,
    "address": "India Gate, Delhi"
  }
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `event` | String | Event ID |
| `location.latitude` | Number | GPS latitude |
| `location.longitude` | Number | GPS longitude |

**Optional Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `location.address` | String | GPS address |

**Response:**
```json
{
  "success": true,
  "message": "Checked out successfully. Work hours: 9",
  "data": {
    "_id": "ATTENDANCE_ID",
    "user": "USER_ID",
    "event": "EVENT_ID",
    "checkIn": {...},
    "checkOut": {
      "time": "2024-02-10T18:00:00Z",
      "location": {...}
    },
    "workHours": 9,
    "status": "Present"
  }
}
```

---

### 6.5 Get Attendance Summary
**GET** `https://event-backend-lqu0.onrender.com/api/attendance/summary/:userId`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | String | User ID (MongoDB ObjectId) |

**Example:**
```
GET https://event-backend-lqu0.onrender.com/api/attendance/summary/6981f35a75abdaecf610b757
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDays": 20,
    "presentDays": 18,
    "absentDays": 2,
    "totalWorkHours": 162,
    "averageWorkHours": 9,
    "byStatus": [
      {
        "_id": "Present",
        "count": 18
      },
      {
        "_id": "Absent",
        "count": 2
      }
    ]
  }
}
```

---

## 7. Tasks Management

### 7.1 Get All My Tasks
**GET** `https://event-backend-lqu0.onrender.com/api/tasks`

**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | String | Filter by event ID |
| `status` | String | `Pending`, `In Progress`, `Completed` |
| `priority` | String | `High`, `Medium`, `Low` |

**Examples:**
```
GET https://event-backend-lqu0.onrender.com/api/tasks
GET https://event-backend-lqu0.onrender.com/api/tasks?event=EVENT_ID
GET https://event-backend-lqu0.onrender.com/api/tasks?status=Pending&priority=High
```

**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "TASK_ID",
      "title": "Follow up with leads",
      "description": "Contact all new leads from yesterday",
      "event": {...},
      "assignedTo": {...},
      "assignedBy": {...},
      "dueDate": "2024-02-10T18:00:00Z",
      "priority": "High",
      "status": "Pending",
      "createdAt": "2024-02-05T10:00:00Z"
    }
  ]
}
```

---

### 7.2 Get Single Task
**GET** `https://event-backend-lqu0.onrender.com/api/tasks/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Task ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "TASK_ID",
    "title": "Follow up with leads",
    "description": "Contact all new leads from yesterday",
    "event": {...},
    "assignedTo": {...},
    "assignedBy": {...},
    "dueDate": "2024-02-10T18:00:00Z",
    "priority": "High",
    "status": "Pending",
    "completedAt": null
  }
}
```

---

### 7.3 Create Task
**POST** `https://event-backend-lqu0.onrender.com/api/tasks`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "title": "Follow up with leads",
  "description": "Contact all new leads from yesterday",
  "event": "EVENT_ID",
  "assignedTo": "USER_ID",
  "dueDate": "2024-02-10T18:00:00Z",
  "priority": "High"
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Task title |
| `event` | String | Event ID (MongoDB ObjectId) |
| `assignedTo` | String | User ID to assign task |
| `dueDate` | String | Due date (ISO 8601 format) |

**Optional Fields:**
| Field | Type | Default |
|-------|------|---------|
| `description` | String | - |
| `priority` | String | `Medium` |

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "TASK_ID",
    "title": "Follow up with leads",
    "event": "EVENT_ID",
    "assignedTo": "USER_ID",
    "status": "Pending",
    "createdAt": "2024-02-05T10:00:00Z"
  }
}
```

---

### 7.4 Update Task
**PUT** `https://event-backend-lqu0.onrender.com/api/tasks/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Task ID |

**Request Body:**
```json
{
  "status": "In Progress",
  "priority": "Medium"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "TASK_ID",
    "title": "Follow up with leads",
    "status": "In Progress",
    "priority": "Medium",
    "updatedAt": "2024-02-05T11:00:00Z"
  }
}
```

---

### 7.5 Complete Task
**PUT** `https://event-backend-lqu0.onrender.com/api/tasks/:id/complete`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Task ID |

**Response:**
```json
{
  "success": true,
  "message": "Task marked as completed",
  "data": {
    "_id": "TASK_ID",
    "title": "Follow up with leads",
    "status": "Completed",
    "completedAt": "2024-02-05T15:00:00Z",
    "updatedAt": "2024-02-05T15:00:00Z"
  }
}
```

---

### 7.6 Delete Task
**DELETE** `https://event-backend-lqu0.onrender.com/api/tasks/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Task ID |

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {}
}
```

---

## 8. File Upload

### 8.1 Upload File
**POST** `https://event-backend-lqu0.onrender.com/api/files/upload`

**Headers:** `Authorization: Bearer TOKEN`

**Request:** `multipart/form-data`
- Field name: `file`
- Supported: Images (JPG, PNG), PDFs, Documents

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', imageFile);

fetch('https://event-backend-lqu0.onrender.com/api/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data.data.filePath));
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filePath": "/uploads/receipts/receipt-1707132000000.jpg"
  }
}
```

**Usage Flow:**
1. Upload file using this endpoint
2. Get `filePath` from response
3. Use `filePath` in expense (receipt) or attendance (selfie) APIs

---

## 9. Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 10. API Reference Table

### Complete Endpoint List

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Authentication** |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/updatedetails` | Update profile |
| PUT | `/api/auth/updatepassword` | Change password |
| **Dashboard** |
| GET | `/api/dashboard/user` | Get dashboard |
| **Events** |
| GET | `/api/events` | Get all events |
| GET | `/api/events/:id` | Get event by ID |
| **Leads** |
| GET | `/api/leads` | Get my leads |
| GET | `/api/leads/:id` | Get lead by ID |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/leads/:id/notes` | Add note |
| POST | `/api/leads/:id/communications` | Add communication |
| **Expenses** |
| GET | `/api/expenses` | Get my expenses |
| GET | `/api/expenses/:id` | Get expense by ID |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/summary/:eventId` | Get summary |
| **Attendance** |
| GET | `/api/attendance` | Get my attendance |
| GET | `/api/attendance/:id` | Get attendance by ID |
| POST | `/api/attendance/check-in` | Check-in |
| POST | `/api/attendance/check-out` | Check-out |
| GET | `/api/attendance/summary/:userId` | Get summary |
| **Tasks** |
| GET | `/api/tasks` | Get my tasks |
| GET | `/api/tasks/:id` | Get task by ID |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PUT | `/api/tasks/:id/complete` | Complete task |
| DELETE | `/api/tasks/:id` | Delete task |
| **Files** |
| POST | `/api/files/upload` | Upload file |

---

## Important Notes

### MongoDB ObjectId Format
All IDs are MongoDB ObjectIds (24 character hex string):
- Example: `6981f35a75abdaecf610b757`
- Used for: Event ID, User ID, Lead ID, Expense ID, Attendance ID, Task ID

### Date Formats
- **ISO 8601:** `2024-02-10T18:00:00Z` (datetime)
- **Date Only:** `2024-02-10` (YYYY-MM-DD)

### GPS Location
- Latitude/Longitude from mobile device GPS
- No separate GPS API needed
- Address field optional (reverse geocoding)

### File Upload Flow
1. Upload file via `/api/files/upload`
2. Get file path from response
3. Use path in expense or attendance API

### User Permissions
- `canCreateLeads: true` - Create/manage leads
- `canViewAllLeads: false` - Cannot view others' leads
- `canApproveExpenses: false` - Cannot approve expenses
- `canViewReports: false` - Cannot access reports

---

**End of Documentation**
