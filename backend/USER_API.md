# Event Management System - Mobile App API Documentation

**Version:** 2.0
**Base URL:** `https://event-backend-lqu0.onrender.com`
**Last Updated:** February 6, 2026

---

## 📋 What's New in Version 2.0

### Daily Reports - NEW Feature
- ✅ **Complete Daily Reporting System**:
  - Auto-pulls Time In from attendance check-in
  - Manual Time Out entry
  - Coverage Summary (Booths Covered, Interviews Conducted)
  - Notes, Challenges, Achievements tracking
  - Draft → Submit → Review workflow
  - Daily summary statistics

- ✅ **7 New Endpoints**:
  - `GET /api/daily-reports` - List all reports
  - `POST /api/daily-reports` - Create report
  - `PUT /api/daily-reports/:id` - Update draft
  - `PUT /api/daily-reports/:id/submit` - Submit for review
  - `DELETE /api/daily-reports/:id` - Delete draft
  - `GET /api/daily-reports/summary/:userId?` - Get statistics

### Lead Management - Major Update
- ✅ **Complete Lead Fields**: Added 30+ fields for comprehensive lead capture
  - Multiple phone numbers with types (Primary, Secondary, WhatsApp)
  - Social media links (LinkedIn, Facebook, Instagram, Twitter, YouTube)
  - Location details (Country, State, City)
  - Industry and service requirements
  - Custom fields for flexible data storage

- ✅ **New Endpoints Added**:
  - `POST /api/leads/:id/followups` - Schedule follow-ups
  - `PUT /api/leads/:id/followups/:followupId` - Mark follow-ups complete
  - `POST /api/leads/:id/attachments` - Attach files (proposals, documents)
  - `POST /api/leads/scan-business-card` - OCR business card scanning
  - `GET /api/leads/reminders` - Get upcoming follow-up reminders

- ✅ **Updated Lead Structure**:
  - Business card image upload support
  - Multiple phone numbers with labels
  - Social media profile links
  - Follow-up tracking with completion status
  - File attachments for proposals/documents
  - Custom fields for any additional data

### Examples for Frontend Developer
**Quick Start - Minimal Lead:**
```json
{
  "name": "John Smith",
  "company": "ABC Corp",
  "phone": "+1234567890",
  "source": "EVENT_ID"
}
```

**Complete Lead with All Fields:**
See section 4.3 for full example with 30+ fields

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
9. [Daily Reports Management](#daily-reports-management)
10. [File Upload](#file-upload)
11. [Response Codes](#response-codes)
12. [API Reference Table](#api-reference-table)

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
      "phones": [
        {
          "number": "+1234567890",
          "type": "Primary",
          "isPrimary": true
        }
      ],
      "email": "john@abc.com",
      "designation": "Marketing Manager",
      "linkedin": "https://linkedin.com/in/johnsmith",
      "location": {
        "country": "India",
        "state": "Delhi",
        "city": "New Delhi"
      },
      "website": "https://www.abccorp.com",
      "industry": "Technology",
      "serviceInterestedIn": "Digital Marketing",
      "interestedIn": "Social Media",
      "source": {
        "_id": "EVENT_ID",
        "name": "Tech Expo 2024"
      },
      "status": "New",
      "priority": "High",
      "assignedTo": {
        "_id": "USER_ID",
        "name": "Manager Name"
      },
      "createdBy": {
        "_id": "USER_ID",
        "name": "Your Name"
      },
      "createdAt": "2024-02-05T10:00:00Z",
      "updatedAt": "2024-02-05T10:00:00Z"
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
    "phones": [
      {
        "number": "+1234567890",
        "type": "Primary",
        "isPrimary": true
      },
      {
        "number": "+9876543210",
        "type": "WhatsApp",
        "isPrimary": false
      }
    ],
    "email": "john@abc.com",
    "designation": "Marketing Manager",
    "linkedin": "https://linkedin.com/in/johnsmith",
    "location": {
      "country": "India",
      "state": "Delhi",
      "city": "New Delhi"
    },
    "website": "https://www.abccorp.com",
    "socialLinks": {
      "linkedin": "https://linkedin.com/company/abccorp",
      "facebook": "https://facebook.com/abccorp",
      "instagram": "https://instagram.com/abccorp"
    },
    "industry": "Technology",
    "serviceInterestedIn": "Digital Marketing",
    "briefRequirement": "Looking for complete digital marketing solutions",
    "interestedIn": "Social Media",
    "source": {
      "_id": "EVENT_ID",
      "name": "Tech Expo 2024"
    },
    "status": "Contacted",
    "priority": "High",
    "assignedTo": {
      "_id": "USER_ID",
      "name": "Manager Name"
    },
    "createdBy": {
      "_id": "USER_ID",
      "name": "Your Name"
    },
    "businessCardImage": "/uploads/business-cards/card.jpg",
    "notes": [
      {
        "_id": "NOTE_ID",
        "text": "Initial contact made, very interested",
        "createdBy": {
          "_id": "USER_ID",
          "name": "Your Name"
        },
        "createdAt": "2024-02-05T11:00:00Z"
      }
    ],
    "communications": [
      {
        "_id": "COMM_ID",
        "type": "call",
        "notes": "Discussed product features and pricing",
        "createdBy": {
          "_id": "USER_ID",
          "name": "Your Name"
        },
        "createdAt": "2024-02-05T12:00:00Z"
      }
    ],
    "followUps": [
      {
        "_id": "FOLLOWUP_ID",
        "date": "2024-02-10T10:00:00Z",
        "description": "Follow up call to discuss proposal",
        "completed": false,
        "createdAt": "2024-02-05T13:00:00Z"
      }
    ],
    "attachments": [
      {
        "_id": "ATTACHMENT_ID",
        "name": "Proposal.pdf",
        "url": "/uploads/attachments/proposal.pdf",
        "uploadedAt": "2024-02-05T14:00:00Z"
      }
    ],
    "customFields": {
      "budget": "50000-100000",
      "timeline": "3 months"
    },
    "createdAt": "2024-02-05T10:00:00Z",
    "updatedAt": "2024-02-05T15:00:00Z"
  }
}
```

---

### 4.3 Create Lead
**POST** `https://event-backend-lqu0.onrender.com/api/leads`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body Example (Minimal):**
```json
{
  "name": "John Smith",
  "company": "ABC Corp",
  "phone": "+1234567890",
  "source": "EVENT_ID"
}
```

**Request Body Example (Complete):**
```json
{
  "name": "John Smith",
  "company": "ABC Corp",
  "phone": "+1234567890",
  "phones": [
    {
      "number": "+1234567890",
      "type": "Primary",
      "isPrimary": true
    },
    {
      "number": "+9876543210",
      "type": "WhatsApp",
      "isPrimary": false
    }
  ],
  "email": "john@abc.com",
  "designation": "Marketing Manager",
  "linkedin": "https://linkedin.com/in/johnsmith",
  "location": {
    "country": "India",
    "state": "Delhi",
    "city": "New Delhi"
  },
  "website": "https://www.abccorp.com",
  "socialLinks": {
    "linkedin": "https://linkedin.com/company/abccorp",
    "facebook": "https://facebook.com/abccorp",
    "instagram": "https://instagram.com/abccorp",
    "twitter": "https://twitter.com/abccorp",
    "youtube": "https://youtube.com/@abccorp",
    "other": "https://other-platform.com/abccorp"
  },
  "industry": "Technology",
  "serviceInterestedIn": "Digital Marketing",
  "briefRequirement": "Looking for complete digital marketing solutions including social media and website development",
  "interestedIn": "Social Media",
  "interestedInOther": "",
  "source": "EVENT_ID",
  "priority": "High",
  "status": "New",
  "businessCardImage": "/uploads/business-cards/card-1707132000000.jpg",
  "customFields": {
    "budget": "50000-100000",
    "timeline": "3 months",
    "referredBy": "Jane Doe"
  }
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Lead contact name |
| `company` | String | Company/Organization name |
| `phone` | String | Primary phone number |
| `source` | String | Event ID (MongoDB ObjectId) where lead was collected |

**Optional Fields - Contact Information:**
| Field | Type | Description |
|-------|------|-------------|
| `phones` | Array | Array of phone objects (see structure below) |
| `email` | String | Email address (must be valid format) |
| `designation` | String | Job title/designation |
| `linkedin` | String | LinkedIn profile URL |

**Optional Fields - Company Information:**
| Field | Type | Description |
|-------|------|-------------|
| `location.country` | String | Country name |
| `location.state` | String | State/Province name |
| `location.city` | String | City name |
| `website` | String | Company website URL |
| `industry` | String | Industry/Business sector |

**Optional Fields - Social Media:**
| Field | Type | Description |
|-------|------|-------------|
| `socialLinks.linkedin` | String | Company LinkedIn URL |
| `socialLinks.facebook` | String | Company Facebook URL |
| `socialLinks.instagram` | String | Company Instagram URL |
| `socialLinks.twitter` | String | Company Twitter URL |
| `socialLinks.youtube` | String | Company YouTube URL |
| `socialLinks.other` | String | Other social media URL |

**Optional Fields - Lead Details:**
| Field | Type | Options/Default | Description |
|-------|------|-----------------|-------------|
| `serviceInterestedIn` | String | - | Service they're interested in |
| `briefRequirement` | String | - | Brief description of requirements |
| `interestedIn` | String | `Print Ads`, `Documentary`, `Interview`, `Website Ads`, `Social Media`, `Event Coverage`, `Other`, `` | Category of interest |
| `interestedInOther` | String | - | Specify if interestedIn is "Other" |
| `priority` | String | `High`, `Medium` (default), `Low` | Lead priority |
| `status` | String | `New` (default), `Contacted`, `Follow-up`, `Qualified`, `Converted`, `Lost` | Lead status |

**Optional Fields - Additional:**
| Field | Type | Description |
|-------|------|-------------|
| `businessCardImage` | String | File path from file upload API |
| `customFields` | Object | Key-value pairs for custom data |

**Phones Array Structure:**
```json
{
  "number": "String (required)",
  "type": "Primary | Secondary | WhatsApp (default: Primary)",
  "isPrimary": "Boolean (default: false)"
}
```

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
    "email": "john@abc.com",
    "designation": "Marketing Manager",
    "location": {
      "country": "India",
      "state": "Delhi",
      "city": "New Delhi"
    },
    "source": {
      "_id": "EVENT_ID",
      "name": "Tech Expo 2024"
    },
    "status": "New",
    "priority": "High",
    "industry": "Technology",
    "serviceInterestedIn": "Digital Marketing",
    "createdBy": {
      "_id": "USER_ID",
      "name": "Your Name"
    },
    "createdAt": "2024-02-05T10:00:00Z",
    "updatedAt": "2024-02-05T10:00:00Z"
  }
}
```

**Note:**
- Upload business card image first using File Upload API at `/api/files/upload`
- Use returned file path in `businessCardImage` field
- All URLs must start with `http://` or `https://`
- Email must be in valid format
- `customFields` can store any additional key-value data you need

---

### 4.4 Update Lead
**PUT** `https://event-backend-lqu0.onrender.com/api/leads/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Lead ID (MongoDB ObjectId) |

**Request Body (All fields optional - send only fields to update):**
```json
{
  "name": "John Smith Updated",
  "company": "ABC Corp Ltd",
  "phone": "+1234567890",
  "phones": [
    {
      "number": "+1234567890",
      "type": "Primary",
      "isPrimary": true
    }
  ],
  "email": "newemail@abc.com",
  "designation": "Senior Marketing Manager",
  "linkedin": "https://linkedin.com/in/johnsmith-updated",
  "location": {
    "country": "India",
    "state": "Maharashtra",
    "city": "Mumbai"
  },
  "website": "https://www.abccorp-updated.com",
  "socialLinks": {
    "linkedin": "https://linkedin.com/company/abccorp-updated"
  },
  "industry": "IT Services",
  "serviceInterestedIn": "Mobile App Development",
  "briefRequirement": "Updated requirement details",
  "interestedIn": "Website Ads",
  "status": "Contacted",
  "priority": "Medium",
  "businessCardImage": "/uploads/business-cards/new-card.jpg",
  "customFields": {
    "budget": "100000-200000",
    "timeline": "6 months"
  }
}
```

**Updatable Fields:**
- All contact fields (name, company, phone, phones, email, designation, linkedin)
- All company fields (location, website, socialLinks, industry)
- All lead detail fields (serviceInterestedIn, briefRequirement, interestedIn, interestedInOther)
- Status and priority
- businessCardImage
- customFields

**Response:**
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "_id": "LEAD_ID",
    "name": "John Smith Updated",
    "company": "ABC Corp Ltd",
    "status": "Contacted",
    "priority": "Medium",
    "email": "newemail@abc.com",
    "designation": "Senior Marketing Manager",
    "updatedAt": "2024-02-05T11:00:00Z"
  }
}
```

**Note:**
- Send only the fields you want to update
- Cannot update `source`, `createdBy`, `assignedTo` via this endpoint
- Use specific endpoints for notes, communications, followups

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
  "text": "Follow-up scheduled for next week"
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
        "text": "Follow-up scheduled for next week",
        "createdBy": {
          "_id": "USER_ID",
          "name": "Your Name"
        },
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
  "type": "call",
  "notes": "Discussed pricing and delivery timelines"
}
```

**Communication Types:** `call`, `email`, `whatsapp`, `meeting`, `other` (lowercase)

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
        "type": "call",
        "notes": "Discussed pricing and delivery timelines",
        "createdBy": {
          "_id": "USER_ID",
          "name": "Your Name"
        },
        "createdAt": "2024-02-05T12:00:00Z"
      }
    ]
  }
}
```

---

### 4.8 Add Follow-Up to Lead
**POST** `https://event-backend-lqu0.onrender.com/api/leads/:id/followups`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Lead ID |

**Request Body:**
```json
{
  "date": "2024-02-15T10:00:00Z",
  "description": "Follow up call to discuss proposal details"
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `date` | String | Follow-up date/time (ISO 8601 format) |
| `description` | String | Follow-up description |

**Response:**
```json
{
  "success": true,
  "message": "Follow-up added successfully",
  "data": {
    "_id": "LEAD_ID",
    "followUps": [
      {
        "_id": "FOLLOWUP_ID",
        "date": "2024-02-15T10:00:00Z",
        "description": "Follow up call to discuss proposal details",
        "completed": false,
        "createdAt": "2024-02-05T10:00:00Z"
      }
    ]
  }
}
```

---

### 4.9 Update Follow-Up Status
**PUT** `https://event-backend-lqu0.onrender.com/api/leads/:id/followups/:followupId`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Lead ID |
| `followupId` | String | Follow-up ID |

**Request Body:**
```json
{
  "completed": true,
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Follow-up updated successfully",
  "data": {
    "_id": "LEAD_ID",
    "followUps": [
      {
        "_id": "FOLLOWUP_ID",
        "date": "2024-02-15T10:00:00Z",
        "description": "Updated description",
        "completed": true,
        "createdAt": "2024-02-05T10:00:00Z"
      }
    ]
  }
}
```

---

### 4.10 Attach File to Lead
**POST** `https://event-backend-lqu0.onrender.com/api/leads/:id/attachments`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Lead ID |

**Request Body:**
```json
{
  "attachments": [
    {
      "name": "Proposal Document.pdf",
      "url": "/uploads/attachments/proposal-1707132000000.pdf"
    },
    {
      "name": "Company Profile.pdf",
      "url": "/uploads/attachments/profile-1707132000000.pdf"
    }
  ]
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `attachments` | Array | Array of attachment objects |
| `attachments[].name` | String | File name |
| `attachments[].url` | String | File path from file upload API |

**Response:**
```json
{
  "success": true,
  "message": "Attachments added successfully",
  "data": {
    "_id": "LEAD_ID",
    "attachments": [
      {
        "_id": "ATTACHMENT_ID",
        "name": "Proposal Document.pdf",
        "url": "/uploads/attachments/proposal.pdf",
        "uploadedAt": "2024-02-05T10:00:00Z"
      }
    ]
  }
}
```

**Note:** Upload files first using File Upload API at `/api/files/upload`, then use returned paths.

---

### 4.11 Scan Business Card
**POST** `https://event-backend-lqu0.onrender.com/api/leads/scan-business-card`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "imageUrl": "/uploads/business-cards/card-1707132000000.jpg"
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `imageUrl` | String | File path from file upload API |

**Response:**
```json
{
  "success": true,
  "message": "Business card scanned successfully",
  "data": {
    "name": "John Smith",
    "company": "ABC Corp",
    "phone": "+1234567890",
    "email": "john@abc.com",
    "designation": "Marketing Manager",
    "website": "https://www.abccorp.com",
    "address": "123 Main St, New Delhi"
  }
}
```

**Note:**
- Upload business card image first using File Upload API
- This endpoint uses OCR to extract text from business card
- Extracted data can be used to pre-fill lead creation form
- Accuracy depends on image quality

---

### 4.12 Get My Reminders
**GET** `https://event-backend-lqu0.onrender.com/api/leads/reminders`

**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | String | Filter from date (YYYY-MM-DD) |
| `endDate` | String | Filter to date (YYYY-MM-DD) |

**Example:**
```
GET https://event-backend-lqu0.onrender.com/api/leads/reminders
GET https://event-backend-lqu0.onrender.com/api/leads/reminders?startDate=2024-02-01&endDate=2024-02-28
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "FOLLOWUP_ID",
      "lead": {
        "_id": "LEAD_ID",
        "name": "John Smith",
        "company": "ABC Corp",
        "phone": "+1234567890",
        "status": "Contacted",
        "priority": "High"
      },
      "date": "2024-02-15T10:00:00Z",
      "description": "Follow up call to discuss proposal details",
      "completed": false,
      "createdAt": "2024-02-05T10:00:00Z"
    }
  ]
}
```

**Note:** Returns all upcoming and pending follow-ups for your leads

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

## 8. Daily Reports Management

### 8.1 Get All My Daily Reports
**GET** `https://event-backend-lqu0.onrender.com/api/daily-reports`

**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | String | Filter by event ID |
| `status` | String | `Draft`, `Submitted`, `Approved`, `Rejected` |
| `startDate` | String | Filter from date (YYYY-MM-DD) |
| `endDate` | String | Filter to date (YYYY-MM-DD) |

**Examples:**
```
GET https://event-backend-lqu0.onrender.com/api/daily-reports
GET https://event-backend-lqu0.onrender.com/api/daily-reports?event=EVENT_ID
GET https://event-backend-lqu0.onrender.com/api/daily-reports?status=Submitted
GET https://event-backend-lqu0.onrender.com/api/daily-reports?startDate=2024-02-01&endDate=2024-02-28
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "REPORT_ID",
      "user": {
        "_id": "USER_ID",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "Field User"
      },
      "event": {
        "_id": "EVENT_ID",
        "name": "Tech Expo 2024",
        "startDate": "2024-02-10T00:00:00Z",
        "endDate": "2024-02-12T00:00:00Z"
      },
      "date": "2024-02-10T00:00:00Z",
      "timeIn": "2024-02-10T09:00:00Z",
      "timeOut": "2024-02-10T18:00:00Z",
      "workHours": 9,
      "coverageSummary": {
        "boothsCovered": 15,
        "interviewsConducted": 8
      },
      "notes": "Good day with high engagement",
      "challenges": "Booth 5 was closed in afternoon",
      "achievements": "Met daily target of 10 booths",
      "status": "Submitted",
      "submittedAt": "2024-02-10T18:30:00Z",
      "createdAt": "2024-02-10T10:00:00Z",
      "updatedAt": "2024-02-10T18:30:00Z"
    }
  ]
}
```

---

### 8.2 Get Single Daily Report
**GET** `https://event-backend-lqu0.onrender.com/api/daily-reports/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Report ID (MongoDB ObjectId) |

**Example:**
```
GET https://event-backend-lqu0.onrender.com/api/daily-reports/6981f35a75abdaecf610b757
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "REPORT_ID",
    "user": {
      "_id": "USER_ID",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Field User",
      "phone": "+1234567890"
    },
    "event": {
      "_id": "EVENT_ID",
      "name": "Tech Expo 2024",
      "startDate": "2024-02-10T00:00:00Z",
      "endDate": "2024-02-12T00:00:00Z",
      "location": {
        "city": "Delhi",
        "venue": "India Gate"
      }
    },
    "attendance": {
      "_id": "ATTENDANCE_ID",
      "checkIn": {
        "time": "2024-02-10T09:00:00Z"
      },
      "checkOut": {
        "time": "2024-02-10T18:00:00Z"
      },
      "workHours": 9
    },
    "date": "2024-02-10T00:00:00Z",
    "timeIn": "2024-02-10T09:00:00Z",
    "timeOut": "2024-02-10T18:00:00Z",
    "workHours": 9,
    "coverageSummary": {
      "boothsCovered": 15,
      "interviewsConducted": 8
    },
    "notes": "Good day with high engagement at all booths",
    "challenges": "Booth 5 was closed during afternoon session",
    "achievements": "Successfully met daily target of 10 booths",
    "status": "Approved",
    "submittedAt": "2024-02-10T18:30:00Z",
    "reviewedBy": {
      "_id": "ADMIN_ID",
      "name": "Admin Name",
      "email": "admin@example.com"
    },
    "reviewedAt": "2024-02-11T10:00:00Z",
    "reviewComments": "Good work! Keep it up.",
    "createdAt": "2024-02-10T10:00:00Z",
    "updatedAt": "2024-02-11T10:00:00Z"
  }
}
```

---

### 8.3 Create Daily Report
**POST** `https://event-backend-lqu0.onrender.com/api/daily-reports`

**Headers:** `Authorization: Bearer TOKEN`

**Important Prerequisites:**
- ✅ Must have checked in (attendance) for today
- ✅ `timeIn` is automatically pulled from attendance check-in
- ✅ `timeOut` can be manually entered or auto-filled from attendance check-out
- ✅ `date` is set to current date automatically

**Request Body (Minimal):**
```json
{
  "event": "EVENT_ID",
  "timeOut": "2024-02-10T18:00:00Z",
  "coverageSummary": {
    "boothsCovered": 15,
    "interviewsConducted": 8
  }
}
```

**Request Body (Complete):**
```json
{
  "event": "EVENT_ID",
  "timeOut": "2024-02-10T18:00:00Z",
  "coverageSummary": {
    "boothsCovered": 15,
    "interviewsConducted": 8
  },
  "notes": "Covered all major booths in Hall A and B. Good lead quality today.",
  "challenges": "Booth 5 was closed during afternoon. Some exhibitors left early.",
  "achievements": "Met daily target of 10 booths. Collected 8 quality leads with follow-up scheduled."
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `event` | String | Event ID (MongoDB ObjectId) |
| `coverageSummary.boothsCovered` | Number | Number of booths visited (≥ 0) |
| `coverageSummary.interviewsConducted` | Number | Number of interviews done (≥ 0) |

**Optional Fields:**
| Field | Type | Max Length | Description |
|-------|------|-----------|-------------|
| `timeOut` | String (ISO 8601) | - | Manual checkout time |
| `notes` | String | 1000 chars | General notes about the day |
| `challenges` | String | 500 chars | Challenges faced during the day |
| `achievements` | String | 500 chars | Achievements and highlights |

**Auto-Filled Fields:**
| Field | Description |
|-------|-------------|
| `user` | Current logged-in user |
| `attendance` | Today's attendance record ID |
| `timeIn` | From attendance check-in time |
| `date` | Current date |
| `status` | Set to `Draft` |

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "REPORT_ID",
    "user": "USER_ID",
    "event": "EVENT_ID",
    "attendance": "ATTENDANCE_ID",
    "date": "2024-02-10T00:00:00Z",
    "timeIn": "2024-02-10T09:00:00Z",
    "timeOut": "2024-02-10T18:00:00Z",
    "workHours": 9,
    "coverageSummary": {
      "boothsCovered": 15,
      "interviewsConducted": 8
    },
    "notes": "Covered all major booths in Hall A and B",
    "status": "Draft",
    "createdAt": "2024-02-10T10:00:00Z"
  }
}
```

**Error Responses:**

**No Attendance Found:**
```json
{
  "success": false,
  "message": "No attendance record found for today. Please check in first."
}
```

**Duplicate Report:**
```json
{
  "success": false,
  "message": "Daily report already exists for today"
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    "Booths covered cannot be negative",
    "Interviews conducted cannot be negative"
  ]
}
```

---

### 8.4 Update Daily Report
**PUT** `https://event-backend-lqu0.onrender.com/api/daily-reports/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Report ID |

**Request Body:**
```json
{
  "timeOut": "2024-02-10T19:00:00Z",
  "coverageSummary": {
    "boothsCovered": 18,
    "interviewsConducted": 10
  },
  "notes": "Updated notes with final booth count",
  "challenges": "Updated challenges list",
  "achievements": "Exceeded daily target by 20%"
}
```

**Restrictions:**
- ✅ Can only update **Draft** reports
- ✅ Can only update **your own** reports
- ❌ Cannot update Submitted/Approved/Rejected reports

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "REPORT_ID",
    "user": {
      "_id": "USER_ID",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "event": {
      "_id": "EVENT_ID",
      "name": "Tech Expo 2024"
    },
    "timeOut": "2024-02-10T19:00:00Z",
    "coverageSummary": {
      "boothsCovered": 18,
      "interviewsConducted": 10
    },
    "notes": "Updated notes with final booth count",
    "status": "Draft",
    "updatedAt": "2024-02-10T18:45:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Not authorized to update this report"
}
```

---

### 8.5 Submit Daily Report
**PUT** `https://event-backend-lqu0.onrender.com/api/daily-reports/:id/submit`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Report ID |

**Request Body:**
```json
{}
```
(No body required - just triggers submission)

**What This Does:**
- Changes status from `Draft` to `Submitted`
- Sets `submittedAt` timestamp
- Report becomes read-only (cannot be edited)
- Notifies admin/manager for review

**Response:**
```json
{
  "success": true,
  "message": "Daily report submitted successfully",
  "data": {
    "_id": "REPORT_ID",
    "status": "Submitted",
    "submittedAt": "2024-02-10T18:30:00Z",
    "coverageSummary": {
      "boothsCovered": 18,
      "interviewsConducted": 10
    },
    "updatedAt": "2024-02-10T18:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Report is not in Draft status"
}
```

---

### 8.6 Delete Daily Report
**DELETE** `https://event-backend-lqu0.onrender.com/api/daily-reports/:id`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Report ID |

**Restrictions:**
- Can only delete **Draft** reports
- Can only delete **your own** reports

**Response:**
```json
{
  "success": true,
  "message": "Daily report deleted successfully",
  "data": {}
}
```

---

### 8.7 Get Daily Report Summary
**GET** `https://event-backend-lqu0.onrender.com/api/daily-reports/summary/:userId?`

**Headers:** `Authorization: Bearer TOKEN`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | String | User ID (optional - defaults to your own ID) |

**Examples:**
```
GET https://event-backend-lqu0.onrender.com/api/daily-reports/summary
GET https://event-backend-lqu0.onrender.com/api/daily-reports/summary/6981f35a75abdaecf610b757
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReports": 20,
    "totalBoothsCovered": 250,
    "totalInterviewsConducted": 150,
    "averageBoothsPerDay": 12.5,
    "averageInterviewsPerDay": 7.5,
    "byStatus": [
      {
        "_id": "Approved",
        "count": 15
      },
      {
        "_id": "Submitted",
        "count": 3
      },
      {
        "_id": "Draft",
        "count": 2
      }
    ],
    "totalWorkHours": 180,
    "averageWorkHours": 9
  }
}
```

---

## 9. File Upload

### 9.1 Upload File
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

## 10. Response Codes

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

## 11. API Reference Table

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
| POST | `/api/leads/:id/followups` | Add follow-up |
| PUT | `/api/leads/:id/followups/:followupId` | Update follow-up |
| POST | `/api/leads/:id/attachments` | Attach file |
| POST | `/api/leads/scan-business-card` | Scan business card |
| GET | `/api/leads/reminders` | Get my reminders |
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
| **Daily Reports** |
| GET | `/api/daily-reports` | Get my daily reports |
| GET | `/api/daily-reports/:id` | Get report by ID |
| POST | `/api/daily-reports` | Create daily report |
| PUT | `/api/daily-reports/:id` | Update report |
| PUT | `/api/daily-reports/:id/submit` | Submit report |
| DELETE | `/api/daily-reports/:id` | Delete report |
| GET | `/api/daily-reports/summary/:userId?` | Get report summary |
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
