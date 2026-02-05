# Lead Management API Reference

Base URL: `http://localhost:5003/api/leads`

---

## 🎯 Quick Setup for Postman

1. **Create a new Environment** in Postman with these variables:
   - `base_url` = `http://localhost:5003`
   - `token` = (leave empty, will be filled after login)
   - `source_id` = (will be filled after getting events)
   - `lead_id` = (will be filled after creating a lead)

2. **Set Authorization Header** globally:
   - Type: Bearer Token
   - Token: `{{token}}`

3. **First Steps:**
   - Login → Copy token to `{{token}}` variable
   - Get Events → Copy an event ID to `{{source_id}}` variable
   - Create Lead → Copy lead ID to `{{lead_id}}` variable
   - Now you can use `{{source_id}}` and `{{lead_id}}` in all requests

---

## 🔐 Authentication

All endpoints require Bearer token in header:
```
Authorization: Bearer YOUR_TOKEN
```

Get token from login:
```bash
POST http://localhost:5003/api/auth/login
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

---

## 📝 Create Lead

**POST** `/api/leads`

**Body:**
```json
{
  "name": "John Doe",
  "company": "ABC Corporation",
  "phone": "+1234567890",
  "email": "john.doe@abc.com",
  "designation": "CEO",
  "source": "6981f35a75abdaecf610b757",
  "priority": "High",
  "status": "New"
}
```

**Required Fields:**
- `name` (String)
- `company` (String)
- `phone` (String)
- `source` (ObjectId) - Event reference

**Optional Fields:**
- `email` (String)
- `designation` (String)
- `priority` (High/Medium/Low) - Default: Medium
- `status` (New/Contacted/Follow-up/Qualified/Converted/Lost) - Default: New

---

## 📋 Get All Leads

**GET** `/api/leads`

**Query Parameters:**
- `source` - Filter by source event ID
- `status` - Filter by status
- `priority` - Filter by priority
- `assignedTo` - Filter by user ID
- `search` - Search in name, company, email

**Example:**
```
GET /api/leads?source=SOURCE_ID&status=New&priority=High
```

---

## 👤 Get Single Lead

**GET** `/api/leads/:id`

**Example:**
```
GET /api/leads/65abc123def456789
```

---

## ✏️ Update Lead

**PUT** `/api/leads/:id`

**Body:**
```json
{
  "status": "Contacted",
  "priority": "High"
}
```

---

## 🗑️ Delete Lead

**DELETE** `/api/leads/:id`

---

## 📦 Bulk Import (CSV)

**POST** `/api/leads/bulk-import`

**Body:**
```json
{
  "sourceId": "SOURCE_EVENT_ID",
  "leads": [
    {
      "name": "Jane Smith",
      "company": "XYZ Inc",
      "phone": "+1234567891",
      "email": "jane@xyz.com",
      "designation": "Manager"
    },
    {
      "name": "Bob Johnson",
      "company": "123 Ltd",
      "phone": "+1234567892",
      "email": "bob@123.com"
    }
  ]
}
```

**Fields:**
- `sourceId` (Required) - Source event ID to assign all leads to
- `leads` (Required) - Array of lead objects

---

## 📸 Business Card OCR

### Step 1: Upload Image

**POST** `/api/files/upload`

**Body:** (multipart/form-data)
- `file` - Business card image

### Step 2: Scan with OCR

**POST** `/api/leads/scan-business-card`

**Body:**
```json
{
  "imageUrl": "/uploads/1234567890-card.jpg",
  "sourceId": "SOURCE_EVENT_ID"
}
```

Automatically extracts: Name, Company, Phone, Email, Designation

---

## 👥 Assign Lead

**POST** `/api/leads/:id/assign`

**Body:**
```json
{
  "userId": "USER_ID"
}
```

---

## 📝 Add Note

**POST** `/api/leads/:id/notes`

**Body:**
```json
{
  "text": "Called client, interested in product demo next week"
}
```

---

## 📅 Follow-ups

### Add Follow-up

**POST** `/api/leads/:id/followups`

**Body:**
```json
{
  "date": "2024-02-10T14:00:00Z",
  "description": "Schedule product demo"
}
```

### Update Follow-up

**PUT** `/api/leads/:id/followups/:followupId`

**Body:**
```json
{
  "completed": true,
  "description": "Demo completed. Client wants proposal."
}
```

---

## 📞 Communication Tracking

**POST** `/api/leads/:id/communications`

**Body:**
```json
{
  "type": "call",
  "notes": "Discussed pricing. Client interested."
}
```

**Types:** `call`, `email`, `whatsapp`, `meeting`, `other`

**Examples:**

**Phone Call:**
```json
{
  "type": "call",
  "notes": "30-min call discussing requirements"
}
```

**Email:**
```json
{
  "type": "email",
  "notes": "Sent product brochure and pricing"
}
```

**WhatsApp:**
```json
{
  "type": "whatsapp",
  "notes": "Sent: Hi John, following up on Tech Expo meeting"
}
```

**Meeting:**
```json
{
  "type": "meeting",
  "notes": "In-person meeting at their office. Very positive."
}
```

---

## 📎 Attachments

### Step 1: Upload File

**POST** `/api/files/upload`

**Body:** (multipart/form-data)
- `file` - Document/PDF/Image

### Step 2: Attach to Lead

**POST** `/api/leads/:id/attachments`

**Body:**
```json
{
  "name": "Product Brochure.pdf",
  "url": "/uploads/1234567890-brochure.pdf"
}
```

---

## 🔔 Reminders

**GET** `/api/leads/reminders?days=7`

Get upcoming follow-ups for next N days.

**Query Parameters:**
- `days` - Number of days ahead (default: 7)

**Example:**
```
GET /api/leads/reminders?days=1  (Today's reminders)
GET /api/leads/reminders?days=7  (This week)
```

---

## 📊 Source Report

**GET** `/api/leads/reports/source/:sourceId`

**Returns:**
- Total leads
- Status breakdown
- Priority distribution
- Source analytics
- User performance
- Conversion rate

**Example:**
```
GET /api/leads/reports/source/6981f35a75abdaecf610b757
```

---

## 📥 Export

### Export to Excel

**GET** `/api/leads/export/excel?source=SOURCE_ID`

**Query Parameters:**
- `source` - Filter by source event
- `status` - Filter by status
- `assignedTo` - Filter by user

**Examples:**
```
GET /api/leads/export/excel
GET /api/leads/export/excel?source=SOURCE_ID
GET /api/leads/export/excel?status=Converted
GET /api/leads/export/excel?source=SOURCE_ID&status=Qualified
```

### Export to CSV

**GET** `/api/leads/export/csv?source=SOURCE_ID`

Same query parameters as Excel export.

---

## 📊 Field Values

### Lead Fields:
- **Name** (String, Required)
- **Company** (String, Required)
- **Phone** (String, Required)
- **Email** (String, Optional)
- **Designation** (String, Optional)
- **Source** (Event ObjectId, Required) - Which event this lead came from
- **Notes** (Array of note objects)
- **Priority** (Enum)
- **Status** (Enum)

### Status Options:
- `New` - Newly created
- `Contacted` - Initial contact made
- `Follow-up` - Needs follow-up
- `Qualified` - Qualified prospect
- `Converted` - Successfully converted
- `Lost` - Lead lost

### Priority Options:
- `High` - Urgent
- `Medium` - Standard (default)
- `Low` - Low priority

### Source:
- References an Event ObjectId
- Indicates which event the lead came from
- Required field

### Communication Types:
- `call` - Phone call
- `email` - Email
- `whatsapp` - WhatsApp
- `meeting` - In-person meeting
- `other` - Other communication

---

## 🧪 Quick Test Flow

1. **Login:**
```bash
POST /api/auth/login
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

2. **Get Event ID (First Time):**
```bash
GET /api/events
# Copy an event ID from the response to use as SOURCE_ID
```

3. **Create Lead:**
```bash
POST /api/leads
{
  "name": "Test Lead",
  "company": "Test Corp",
  "phone": "+1234567890",
  "email": "test@test.com",
  "source": "6981f35a75abdaecf610b757",
  "priority": "High"
}
```

4. **Add Note:**
```bash
POST /api/leads/LEAD_ID/notes
{
  "text": "Initial contact made"
}
```

5. **Track Call:**
```bash
POST /api/leads/LEAD_ID/communications
{
  "type": "call",
  "notes": "Discussed requirements"
}
```

6. **Schedule Follow-up:**
```bash
POST /api/leads/LEAD_ID/followups
{
  "date": "2024-02-10T10:00:00Z",
  "description": "Product demo"
}
```

7. **Update Status:**
```bash
PUT /api/leads/LEAD_ID
{
  "status": "Contacted"
}
```

8. **Get All Leads:**
```bash
GET /api/leads?status=Contacted
```

9. **Export:**
```bash
GET /api/leads/export/excel?status=Contacted
```

---

## ✅ Testing Checklist

- [ ] Create lead manually
- [ ] Get all leads
- [ ] Get single lead
- [ ] Update lead status
- [ ] Add note
- [ ] Track communication (call/email/WhatsApp)
- [ ] Schedule follow-up
- [ ] Update follow-up as completed
- [ ] Assign lead to user
- [ ] Upload business card and scan with OCR
- [ ] Bulk import from CSV
- [ ] Attach file to lead
- [ ] Get reminders
- [ ] Generate source report
- [ ] Export to Excel
- [ ] Export to CSV
- [ ] Delete lead

---
---

# 💰 Expense Management API Reference

---

## 🎯 API Overview

The Expense Management system has **two separate API endpoints**:

### 👤 User/Mobile APIs (`/api/expenses`)
**Purpose:** For regular users (mobile app/field staff) to manage their own expenses
- Create, view, update, delete own expenses
- Only see their own expenses
- Can only edit/delete pending expenses
- Get expense summaries for events

### 🔐 Admin APIs (`/api/admin/expenses`)
**Purpose:** For admin panel to manage all expenses across the organization
- View **ALL** expenses from all users
- Approve/Reject expenses
- Delete any expense
- Generate comprehensive reports (by event, user, category)
- Export to Excel
- Advanced filtering and analytics

---

# 👤 USER/MOBILE APIs

Base URL: `http://localhost:5003/api/expenses`

---

## 🔐 Authentication

All endpoints require Bearer token:
```
Authorization: Bearer YOUR_TOKEN
```

---

## 📝 Create Expense (Mobile User)

**POST** `/api/expenses`

**Body:**
```json
{
  "amount": 1500,
  "category": "Travel",
  "subCategory": "Cab",
  "description": "Uber from airport to hotel",
  "date": "2024-02-05T10:30:00Z",
  "event": "EVENT_ID",
  "receipt": "/uploads/receipt-123.jpg",
  "paymentMethod": "UPI",
  "billNumber": "BILL-001"
}
```

**Required Fields:**
- `amount` (Number, min: 0)
- `category` (Travel/Food/Stay/Misc)
- `description` (String, max 500 chars)
- `date` (Date)
- `event` (Event ObjectId)

**Optional Fields:**
- `subCategory` (Cab/Train/Flight/Bus/Other)
- `receipt` (String - file URL)
- `paymentMethod` (Cash/Card/UPI/Bank Transfer/Other)
- `billNumber` (String)

**Note:** `user` field is auto-filled from logged-in user's ID

---

## 📋 Get My Expenses

**GET** `/api/expenses`

**Query Parameters:**
- `event` - Filter by event ID
- `category` - Filter by category
- `status` - Filter by status (Pending/Approved/Rejected)
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)

**Examples:**
```
GET /api/expenses
GET /api/expenses?event=EVENT_ID
GET /api/expenses?status=Pending
GET /api/expenses?category=Travel&status=Approved
GET /api/expenses?startDate=2024-02-01&endDate=2024-02-28
```

**Returns:** Only expenses created by the logged-in user

---

## 👤 Get Single Expense

**GET** `/api/expenses/:id`

**Example:**
```
GET /api/expenses/65abc123def456789
```

**Note:** Users can only view their own expenses

---

## ✏️ Update Expense

**PUT** `/api/expenses/:id`

**Body:**
```json
{
  "amount": 2000,
  "description": "Updated: Uber from airport to hotel with waiting charges"
}
```

**Restrictions:**
- Users can **only update their own expenses**
- Can **only update expenses with status "Pending"**
- Cannot update approved/rejected expenses

---

## 🗑️ Delete Expense

**DELETE** `/api/expenses/:id`

**Restrictions:**
- Users can **only delete their own expenses**
- Can **only delete expenses with status "Pending"**
- Cannot delete approved/rejected expenses

---

## 📊 Get Expense Summary (Event-wise)

**GET** `/api/expenses/summary/:eventId`

**Example:**
```
GET /api/expenses/summary/6981f35a75abdaecf610b757
```

**Returns:**
Aggregated expense summary by category for the event:
```json
{
  "success": true,
  "data": [
    {
      "_id": "Travel",
      "totalAmount": 5000,
      "count": 10,
      "approved": 3000,
      "pending": 2000,
      "rejected": 0
    },
    {
      "_id": "Food",
      "totalAmount": 2500,
      "count": 5,
      "approved": 2500,
      "pending": 0,
      "rejected": 0
    }
  ]
}
```

---

# 🔐 ADMIN APIs

Base URL: `http://localhost:5003/api/admin/expenses`

**Required Permission:** `canApproveExpenses` (Manager/Admin roles)

---

## 📋 Get All Expenses (Admin View)

**GET** `/api/admin/expenses`

**Query Parameters:**
- `event` - Filter by event ID
- `user` - Filter by user ID
- `status` - Filter by status
- `category` - Filter by category
- `search` - Search in description
- `startDate` - Filter from date
- `endDate` - Filter to date

**Examples:**
```
GET /api/admin/expenses
GET /api/admin/expenses?status=Pending
GET /api/admin/expenses?event=EVENT_ID&status=Pending
GET /api/admin/expenses?user=USER_ID
GET /api/admin/expenses?search=uber
```

**Returns:** **ALL** expenses from all users (no user filtering)

---

## 👤 Get Single Expense (Admin View)

**GET** `/api/admin/expenses/:id`

**Example:**
```
GET /api/admin/expenses/65abc123def456789
```

**Returns:** Full expense details with event, user, and approver information

---

## ✅ Review Expense (Approve/Reject)

**PUT** `/api/admin/expenses/:id/review`

**Body:**
```json
{
  "status": "Approved",
  "adminComments": "Approved. Receipt verified."
}
```

**OR**

```json
{
  "status": "Rejected",
  "adminComments": "Receipt not clear. Please resubmit with proper bill."
}
```

**Required Fields:**
- `status` - Must be "Approved" or "Rejected"

**Optional Fields:**
- `adminComments` - Admin's review notes

**Note:**
- Sets `approvedBy` to current admin's ID
- Sets `approvedAt` to current timestamp
- Required permission: `canApproveExpenses`

---

## 🗑️ Delete Expense (Admin)

**DELETE** `/api/admin/expenses/:id`

**Required Role:** Admin or Super Admin

**Example:**
```
DELETE /api/admin/expenses/65abc123def456789
```

**Note:** Admin can delete any expense regardless of status

---

## 📊 Get Expenses by Event (Report)

**GET** `/api/admin/expenses/reports/event/:eventId`

**Example:**
```
GET /api/admin/expenses/reports/event/6981f35a75abdaecf610b757
```

**Returns:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "6981f35a75abdaecf610b757",
      "name": "Tech Expo 2024",
      "startDate": "2024-02-10",
      "endDate": "2024-02-12"
    },
    "stats": {
      "total": 50,
      "totalAmount": 125000,
      "byStatus": {
        "Pending": 10,
        "Approved": 35,
        "Rejected": 5
      },
      "byCategory": {
        "Travel": 20,
        "Food": 15,
        "Stay": 10,
        "Misc": 5
      },
      "byUser": {
        "John Doe": 25000,
        "Jane Smith": 30000
      },
      "pendingAmount": 20000,
      "approvedAmount": 100000,
      "rejectedAmount": 5000
    },
    "expenses": [...]
  }
}
```

---

## 📊 Get Expenses by User (Report)

**GET** `/api/admin/expenses/reports/user/:userId`

**Example:**
```
GET /api/admin/expenses/reports/user/USER_ID
```

**Returns:**
User's expense report with total amount, status breakdown, and category distribution

---

## 📊 Get Expenses by Category (Report)

**GET** `/api/admin/expenses/reports/category/:category`

**Category Options:** Travel, Food, Stay, Misc

**Example:**
```
GET /api/admin/expenses/reports/category/Travel
```

**Returns:**
All expenses in that category with stats and amount breakdown

---

## 📥 Export to Excel (Admin)

**GET** `/api/admin/expenses/export/excel`

**Query Parameters:** (Optional filters)
- `event` - Filter by event ID
- `user` - Filter by user ID
- `status` - Filter by status
- `category` - Filter by category

**Examples:**
```
GET /api/admin/expenses/export/excel
GET /api/admin/expenses/export/excel?status=Approved
GET /api/admin/expenses/export/excel?event=EVENT_ID&status=Pending
GET /api/admin/expenses/export/excel?user=USER_ID
```

**Returns:** Excel file (.xlsx) with columns:
- Date
- User
- Event
- Category
- Sub-Category
- Description
- Amount (₹)
- Status
- Approved By
- Admin Comments

**File Format:** `expenses-{timestamp}.xlsx`

---

## 📊 Expense Field Values

### Expense Fields:
- **Amount** (Number, Required, Min: 0)
- **Category** (Enum, Required)
- **SubCategory** (Enum, Optional)
- **Description** (String, Required, Max: 500 chars)
- **Date** (Date, Required)
- **Event** (Event ObjectId, Required)
- **User** (User ObjectId, Auto-filled)
- **Receipt** (String - File URL)
- **Status** (Enum, Default: Pending)
- **Payment Method** (Enum)
- **Bill Number** (String)
- **Approved By** (User ObjectId)
- **Approved At** (Date)
- **Admin Comments** (String)

### Category Options:
- `Travel` - Transportation expenses
- `Food` - Meals and refreshments
- `Stay` - Accommodation
- `Misc` - Other expenses

### SubCategory Options:
- `Cab` - Taxi/Uber/Ola
- `Train` - Railway
- `Flight` - Air travel
- `Bus` - Bus travel
- `Other` - Other transport

### Status Options:
- `Pending` - Awaiting approval (default)
- `Approved` - Approved by admin
- `Rejected` - Rejected by admin

### Payment Method Options:
- `Cash`
- `Card`
- `UPI`
- `Bank Transfer`
- `Other`

---

## 🧪 Quick Test Flow (User APIs)

1. **Login as User:**
```bash
POST /api/auth/login
{
  "email": "user@gmail.com",
  "password": "user123"
}
```

2. **Create Expense:**
```bash
POST /api/expenses
{
  "amount": 500,
  "category": "Food",
  "description": "Team lunch at restaurant",
  "date": "2024-02-05T13:00:00Z",
  "event": "EVENT_ID",
  "paymentMethod": "Cash"
}
```

3. **View My Expenses:**
```bash
GET /api/expenses
```

4. **Update Pending Expense:**
```bash
PUT /api/expenses/EXPENSE_ID
{
  "amount": 600,
  "description": "Team lunch at restaurant with dessert"
}
```

5. **Get Event Summary:**
```bash
GET /api/expenses/summary/EVENT_ID
```

---

## 🧪 Quick Test Flow (Admin APIs)

1. **Login as Admin:**
```bash
POST /api/auth/login
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

2. **View All Pending Expenses:**
```bash
GET /api/admin/expenses?status=Pending
```

3. **Review Expense (Approve):**
```bash
PUT /api/admin/expenses/EXPENSE_ID/review
{
  "status": "Approved",
  "adminComments": "Verified. Approved for reimbursement."
}
```

4. **Get Event Report:**
```bash
GET /api/admin/expenses/reports/event/EVENT_ID
```

5. **Export to Excel:**
```bash
GET /api/admin/expenses/export/excel?event=EVENT_ID&status=Approved
```

---

## 🔑 Key Differences: User vs Admin APIs

| Feature | User APIs (`/api/expenses`) | Admin APIs (`/api/admin/expenses`) |
|---------|----------------------------|-----------------------------------|
| **View Scope** | Only own expenses | ALL users' expenses |
| **Create** | ✅ Yes | ❌ No (users create) |
| **Update** | ✅ Only own pending | ❌ No |
| **Delete** | ✅ Only own pending | ✅ Any expense (Admin/Super Admin) |
| **Approve/Reject** | ❌ No | ✅ Yes (canApproveExpenses) |
| **Reports** | Basic summary | ✅ Comprehensive (event/user/category) |
| **Export** | ❌ No | ✅ Excel export |
| **Filtering** | Limited (own data) | ✅ Advanced (all filters) |
| **Permission** | Any authenticated user | `canApproveExpenses` required |

---

## ✅ Expense Testing Checklist

### User/Mobile APIs:
- [ ] Create expense with receipt
- [ ] Get all my expenses
- [ ] Get single expense
- [ ] Update pending expense
- [ ] Try to update approved expense (should fail)
- [ ] Delete pending expense
- [ ] Try to delete approved expense (should fail)
- [ ] Get expense summary for event
- [ ] Try to view another user's expense (should fail)

### Admin APIs:
- [ ] View all expenses from all users
- [ ] Filter by event/user/status/category
- [ ] Search expenses by description
- [ ] View single expense details
- [ ] Approve expense with comments
- [ ] Reject expense with reason
- [ ] Delete any expense
- [ ] Generate event report
- [ ] Generate user report
- [ ] Generate category report
- [ ] Export to Excel (all expenses)
- [ ] Export to Excel (filtered by event)
- [ ] Export to Excel (filtered by status)

---

# 📅 Attendance & Check-in API Reference

---

## 🎯 API Overview

The Attendance system has a **single API endpoint** with role-based access control:

### 📱 User/Mobile APIs (`/api/attendance`)
**Purpose:** For regular users (mobile app/field staff) to manage their own attendance
- Check-in/check-out for events
- View own attendance records
- Track work hours
- Upload selfie verification
- Get personal attendance summary

### 🔐 Admin View (Same endpoint with elevated permissions)
**Purpose:** Admins with `canViewReports` permission can:
- View **ALL** users' attendance records
- Filter by user, event, date
- Generate attendance reports
- Monitor team attendance

---

# 📱 USER/MOBILE APIs

Base URL: `http://localhost:5003/api/attendance`

---

## 🔐 Authentication

All endpoints require Bearer token:
```
Authorization: Bearer YOUR_TOKEN
```

---

## ✅ Check In (Mobile User)

**POST** `/api/attendance/checkin`

**Body:**
```json
{
  "event": "EVENT_ID",
  "checkIn": {
    "time": "2024-02-05T09:00:00Z",
    "location": {
      "latitude": 28.7041,
      "longitude": 77.1025,
      "address": "Connaught Place, New Delhi"
    },
    "selfie": "/uploads/selfie-123.jpg"
  },
  "notes": "Arrived on time"
}
```

**Required Fields:**
- `event` (Event ObjectId) - Event reference
- `checkIn.time` (Date) - Check-in timestamp

**Optional Fields:**
- `checkIn.location` - GPS coordinates and address
  - `latitude` (Number)
  - `longitude` (Number)
  - `address` (String)
- `checkIn.selfie` (String) - Selfie image URL
- `notes` (String) - Additional notes

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789",
    "user": "USER_ID",
    "event": "EVENT_ID",
    "date": "2024-02-05T00:00:00Z",
    "checkIn": {
      "time": "2024-02-05T09:00:00Z",
      "location": {
        "latitude": 28.7041,
        "longitude": 77.1025,
        "address": "Connaught Place, New Delhi"
      },
      "selfie": "/uploads/selfie-123.jpg"
    },
    "status": "Present",
    "workHours": 0
  }
}
```

**Note:** User field is auto-filled from logged-in user's ID

---

## 🚪 Check Out

**PUT** `/api/attendance/:id/checkout`

**Body:**
```json
{
  "checkOut": {
    "time": "2024-02-05T18:00:00Z",
    "location": {
      "latitude": 28.7041,
      "longitude": 77.1025,
      "address": "Connaught Place, New Delhi"
    }
  }
}
```

**Required Fields:**
- `checkOut.time` (Date) - Check-out timestamp

**Optional Fields:**
- `checkOut.location` - GPS coordinates and address
  - `latitude` (Number)
  - `longitude` (Number)
  - `address` (String)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789",
    "user": "USER_ID",
    "event": "EVENT_ID",
    "date": "2024-02-05T00:00:00Z",
    "checkIn": {
      "time": "2024-02-05T09:00:00Z"
    },
    "checkOut": {
      "time": "2024-02-05T18:00:00Z"
    },
    "workHours": 9,
    "status": "Present"
  }
}
```

**Note:** Work hours are automatically calculated when checkout is saved

---

## 📋 Get My Attendance Records

**GET** `/api/attendance`

**Query Parameters:**
- `event` - Filter by event ID
- `status` - Filter by status (Present/Absent/Half Day/Leave)
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)

**Examples:**
```
GET /api/attendance
GET /api/attendance?event=EVENT_ID
GET /api/attendance?status=Present
GET /api/attendance?startDate=2024-02-01&endDate=2024-02-28
```

**Returns:** Only attendance records created by the logged-in user

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "65abc123def456789",
      "user": {
        "_id": "USER_ID",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "event": {
        "_id": "EVENT_ID",
        "name": "Tech Expo 2024"
      },
      "date": "2024-02-05T00:00:00Z",
      "checkIn": {
        "time": "2024-02-05T09:00:00Z",
        "location": {
          "latitude": 28.7041,
          "longitude": 77.1025
        }
      },
      "checkOut": {
        "time": "2024-02-05T18:00:00Z"
      },
      "workHours": 9,
      "status": "Present"
    }
  ]
}
```

---

## 👤 Get Single Attendance Record

**GET** `/api/attendance/:id`

**⚠️ IMPORTANT:** The `:id` parameter is an **ATTENDANCE RECORD ID**, NOT a user ID!

**Examples:**
```
GET /api/attendance/6984301c5c6c8e3aba2a2623  (✅ Correct - attendance record ID)
GET /api/attendance/6981e0a775abdaecf610b693  (❌ Wrong - this is a user ID!)
```

**How to get attendance record ID:**
1. Call `GET /api/attendance` to list all records
2. Copy the `_id` field from the response (not the `user._id`)

**Note:** Users can only view their own attendance records

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789",
    "user": {
      "_id": "USER_ID",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "event": {
      "_id": "EVENT_ID",
      "name": "Tech Expo 2024",
      "location": "India Gate, Delhi"
    },
    "date": "2024-02-05T00:00:00Z",
    "checkIn": {
      "time": "2024-02-05T09:00:00Z",
      "location": {
        "latitude": 28.7041,
        "longitude": 77.1025,
        "address": "Connaught Place, New Delhi"
      },
      "selfie": "/uploads/selfie-123.jpg"
    },
    "checkOut": {
      "time": "2024-02-05T18:00:00Z",
      "location": {
        "latitude": 28.7041,
        "longitude": 77.1025
      }
    },
    "workHours": 9,
    "status": "Present",
    "notes": "Arrived on time"
  }
}
```

---

## 📊 Get My Attendance Summary

**GET** `/api/attendance/summary`

Get personal attendance summary (aggregated statistics)

**⚠️ NOTE:** This is different from `/api/attendance/:id` which gets a single attendance record!

**Example:**
```
GET /api/attendance/summary
```

**Returns:** Aggregated summary of your attendance (total days, work hours, status counts)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDays": 20,
    "present": 18,
    "absent": 1,
    "halfDay": 1,
    "leave": 0,
    "totalWorkHours": 162,
    "averageWorkHours": 8.1
  }
}
```

---

# 🔐 ADMIN APIs

Base URL: `http://localhost:5003/api/attendance`

**Required Permission:** `canViewReports` (Manager/Admin roles)

---

## 📋 View All Attendance Records (Admin)

**GET** `/api/attendance`

**Query Parameters:**
- `event` - Filter by event ID
- `user` - Filter by specific user ID
- `status` - Filter by status
- `startDate` - Filter from date
- `endDate` - Filter to date

**Examples:**
```
GET /api/attendance (All users' attendance)
GET /api/attendance?user=USER_ID
GET /api/attendance?event=EVENT_ID&startDate=2024-02-01
GET /api/attendance?status=Present&event=EVENT_ID
```

**Returns:** **ALL** attendance records from all users (no user filtering)

**Response:**
```json
{
  "success": true,
  "count": 250,
  "data": [
    {
      "_id": "65abc123def456789",
      "user": {
        "_id": "USER_ID",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "Field User"
      },
      "event": {
        "_id": "EVENT_ID",
        "name": "Tech Expo 2024"
      },
      "date": "2024-02-05T00:00:00Z",
      "checkIn": {
        "time": "2024-02-05T09:00:00Z",
        "location": {
          "latitude": 28.7041,
          "longitude": 77.1025,
          "address": "Connaught Place, New Delhi"
        },
        "selfie": "/uploads/selfie-123.jpg"
      },
      "checkOut": {
        "time": "2024-02-05T18:00:00Z"
      },
      "workHours": 9,
      "status": "Present"
    }
  ]
}
```

---

## 📊 Get User Attendance Summary (Admin)

**GET** `/api/attendance/summary/:userId`

Get aggregated attendance summary for a specific user

**⚠️ IMPORTANT:** The `:userId` parameter is a **USER ID**, NOT an attendance record ID!

**Examples:**
```
GET /api/attendance/summary/6981e0a775abdaecf610b693  (✅ Correct - user ID)
GET /api/attendance/summary/6984301c5c6c8e3aba2a2623  (❌ Wrong - this is attendance record ID!)
```

**How to get user ID:**
1. Call `GET /api/users` to list all users
2. Copy the `_id` field from the user object
3. OR use the `user._id` from an attendance record response

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6981e0a775abdaecf610b693",
      "name": "John Doe"
    },
    "totalDays": 20,
    "present": 18,
    "absent": 1,
    "halfDay": 1,
    "leave": 0,
    "totalWorkHours": 162,
    "averageWorkHours": 8.1
  }
}
```

---

## 🧪 Quick Test Flow (Admin)

1. **Login as Admin:**
```bash
POST /api/auth/login
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

2. **View All Attendance:**
```bash
GET /api/attendance
```

3. **Filter by User:**
```bash
GET /api/attendance?user=USER_ID
```

4. **Filter by Event:**
```bash
GET /api/attendance?event=EVENT_ID&startDate=2024-02-01&endDate=2024-02-28
```

5. **Get User Summary:**
```bash
GET /api/attendance/summary/USER_ID
```

---

## 🔑 Key Differences: User vs Admin APIs

| Feature | User APIs | Admin APIs |
|---------|-----------|------------|
| **View Scope** | Only own attendance | ALL users' attendance |
| **Check In** | ✅ Yes | ❌ Users check in themselves |
| **Check Out** | ✅ Only own | ❌ Users check out themselves |
| **Filter by User** | ❌ No | ✅ Yes |
| **Summary** | Own summary only | ✅ Any user's summary |
| **Permission** | Any authenticated user | `canViewReports` required |

---

## ⚠️ COMMON MISTAKES - READ THIS!

### Understanding Different ID Types:

There are **TWO different types of IDs** in attendance:

| ID Type | What it identifies | Where to use it | Example |
|---------|-------------------|-----------------|---------|
| **Attendance Record ID** | A single check-in/check-out record | `/api/attendance/:id` | `6984301c5c6c8e3aba2a2623` |
| **User ID** | A person/employee | `/api/attendance/summary/:userId` | `6981e0a775abdaecf610b693` |

### ❌ Common Mistake:
```bash
# WRONG - Using user ID to get attendance record
GET /api/attendance/6981e0a775abdaecf610b693
Response: 404 Not Found ❌

# CORRECT - Use attendance record ID
GET /api/attendance/6984301c5c6c8e3aba2a2623
Response: 200 OK ✅
```

### ✅ Correct Usage:

**To get a single attendance record:**
```bash
# Step 1: List all attendance
GET /api/attendance

# Step 2: Copy the "_id" field (not "user._id"!)
{
  "_id": "6984301c5c6c8e3aba2a2623",  ← Use this ID
  "user": {
    "_id": "6981e0a775abdaecf610b693"  ← Don't use this here!
  }
}

# Step 3: Get that specific record
GET /api/attendance/6984301c5c6c8e3aba2a2623
```

**To get a user's summary:**
```bash
# Step 1: List all attendance or users
GET /api/attendance  OR  GET /api/users

# Step 2: Copy the "user._id" or "_id" from user object
{
  "user": {
    "_id": "6981e0a775abdaecf610b693"  ← Use this ID
  }
}

# Step 3: Get that user's summary
GET /api/attendance/summary/6981e0a775abdaecf610b693
```

---

## 📊 Attendance Field Values

### Attendance Fields:
- **User** (User ObjectId, Auto-filled, Required)
- **Event** (Event ObjectId, Optional)
- **Date** (Date, Required, Default: now)
- **Check In** (Object, Required)
  - `time` (Date, Required)
  - `location` (Object)
    - `latitude` (Number)
    - `longitude` (Number)
    - `address` (String)
  - `selfie` (String - Image URL)
- **Check Out** (Object, Optional)
  - `time` (Date)
  - `location` (Object)
- **Work Hours** (Number, Auto-calculated)
- **Status** (Enum, Default: Present)
- **Notes** (String)

### Status Options:
- `Present` - Checked in and out (default)
- `Absent` - Not checked in
- `Half Day` - Less than expected hours
- `Leave` - Approved leave

---

## 🧪 Quick Test Flow (Attendance)

1. **Login as User:**
```bash
POST /api/auth/login
{
  "email": "user@gmail.com",
  "password": "user123"
}
```

2. **Check In:**
```bash
POST /api/attendance/checkin
{
  "event": "EVENT_ID",
  "checkIn": {
    "time": "2024-02-05T09:00:00Z",
    "location": {
      "latitude": 28.7041,
      "longitude": 77.1025,
      "address": "Event Venue"
    },
    "selfie": "/uploads/selfie-123.jpg"
  }
}
```

3. **Get My Attendance:**
```bash
GET /api/attendance
```

4. **Check Out:**
```bash
PUT /api/attendance/ATTENDANCE_ID/checkout
{
  "checkOut": {
    "time": "2024-02-05T18:00:00Z"
  }
}
```

5. **Get Summary:**
```bash
GET /api/attendance/summary
```

---

## ✅ Attendance Testing Checklist

### User/Mobile APIs:
- [ ] Check in with location and selfie
- [ ] Check in without optional fields
- [ ] Check out
- [ ] Get all my attendance records
- [ ] Filter by event
- [ ] Filter by date range
- [ ] Get single attendance record
- [ ] Get my attendance summary
- [ ] Try to view another user's attendance (should fail)

### Admin APIs:
- [ ] View all users' attendance
- [ ] Filter by specific user
- [ ] Filter by event
- [ ] Filter by date range
- [ ] Filter by status
- [ ] Get specific user's summary

---

---

# ✅ Task Management API Reference

---

## 🎯 API Overview

The Task Management system has a **single API endpoint** with role-based access control:

### 📱 User/Mobile APIs (`/api/tasks`)
**Purpose:** For regular users to manage tasks
- Create tasks
- View tasks assigned to them OR created by them
- Update task status
- Mark tasks as completed
- Delete tasks

### 🔐 Admin View (Same endpoint with elevated permissions)
**Purpose:** Admins with `canViewReports` permission can:
- View **ALL** tasks across all users
- Filter by any user
- Monitor team task progress

---

# 📱 USER/MOBILE APIs

Base URL: `http://localhost:5003/api/tasks`

---

## 🔐 Authentication

All endpoints require Bearer token:
```
Authorization: Bearer YOUR_TOKEN
```

---

## 📝 Create Task

**POST** `/api/tasks`

**Simple Example (Recommended for now):**
```json
{
  "title": "Follow up with leads",
  "description": "Call all qualified leads from Tech Expo",
  "assignedTo": "USER_ID",
  "event": "EVENT_ID",
  "dueDate": "2024-02-10T18:00:00Z",
  "priority": "High"
}
```

**With Reminder (Optional - Not Functional Yet):**
```json
{
  "title": "Follow up with leads",
  "description": "Call all qualified leads from Tech Expo",
  "assignedTo": "USER_ID",
  "event": "EVENT_ID",
  "dueDate": "2024-02-10T18:00:00Z",
  "priority": "High",
  "reminder": {
    "enabled": true,
    "time": "2024-02-10T09:00:00Z"
  }
}
```

**⚠️ NOTE:** The `reminder` field is stored in the database but **notifications are not implemented yet**. You can safely omit this field for now.

**Required Fields:**
- `title` (String, max 255 chars) - Task title
- `assignedTo` (User ObjectId) - User to assign task to

**Optional Fields:**
- `description` (String) - Detailed task description
- `event` (Event ObjectId) - Related event
- `dueDate` (Date) - Task deadline
- `priority` (High/Medium/Low) - Default: Medium
- `reminder` (Object) - **⚠️ Not functional yet - can be omitted**
  - `enabled` (Boolean) - Enable reminder
  - `time` (Date) - Reminder time

**Note:** `assignedBy` field is auto-filled from logged-in user's ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789",
    "title": "Follow up with leads",
    "description": "Call all qualified leads from Tech Expo",
    "assignedTo": "USER_ID",
    "assignedBy": "CURRENT_USER_ID",
    "event": "EVENT_ID",
    "dueDate": "2024-02-10T18:00:00Z",
    "priority": "High",
    "status": "Pending",
    "reminder": {
      "enabled": true,
      "time": "2024-02-10T09:00:00Z"
    },
    "createdAt": "2024-02-05T10:00:00Z"
  }
}
```

---

## 📋 Get My Tasks

**GET** `/api/tasks`

**Query Parameters:**
- `event` - Filter by event ID
- `status` - Filter by status
- `priority` - Filter by priority

**Examples:**
```
GET /api/tasks
GET /api/tasks?event=EVENT_ID
GET /api/tasks?status=Pending
GET /api/tasks?priority=High
```

**Returns:** Tasks assigned to you OR created by you

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "65abc123def456789",
      "title": "Follow up with leads",
      "description": "Call all qualified leads",
      "assignedTo": {
        "_id": "USER_ID",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assignedBy": {
        "_id": "MANAGER_ID",
        "name": "Jane Manager",
        "email": "jane@example.com"
      },
      "event": {
        "_id": "EVENT_ID",
        "name": "Tech Expo 2024"
      },
      "dueDate": "2024-02-10T18:00:00Z",
      "priority": "High",
      "status": "Pending",
      "reminder": {
        "enabled": true,
        "time": "2024-02-10T09:00:00Z"
      },
      "createdAt": "2024-02-05T10:00:00Z"
    }
  ]
}
```

---

## 👤 Get Single Task

**GET** `/api/tasks/:id`

**Example:**
```
GET /api/tasks/65abc123def456789
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789",
    "title": "Follow up with leads",
    "description": "Call all qualified leads from Tech Expo",
    "assignedTo": {
      "_id": "USER_ID",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "assignedBy": {
      "_id": "MANAGER_ID",
      "name": "Jane Manager",
      "email": "jane@example.com"
    },
    "event": {
      "_id": "EVENT_ID",
      "name": "Tech Expo 2024",
      "location": "India Gate, Delhi"
    },
    "dueDate": "2024-02-10T18:00:00Z",
    "priority": "High",
    "status": "Pending",
    "reminder": {
      "enabled": true,
      "time": "2024-02-10T09:00:00Z"
    },
    "createdAt": "2024-02-05T10:00:00Z",
    "updatedAt": "2024-02-05T10:00:00Z"
  }
}
```

---

## ✏️ Update Task

**PUT** `/api/tasks/:id`

**Body:**
```json
{
  "status": "In Progress",
  "priority": "High"
}
```

**Updatable Fields:**
- `title` (String)
- `description` (String)
- `assignedTo` (User ObjectId)
- `event` (Event ObjectId)
- `dueDate` (Date)
- `priority` (High/Medium/Low)
- `status` (Pending/In Progress/Completed/Cancelled)
- `reminder` (Object)
  - `enabled` (Boolean)
  - `time` (Date)

**Auto-set Fields:**
- When status is set to "Completed", `completedAt` is set to current timestamp

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789",
    "title": "Follow up with leads",
    "status": "In Progress",
    "priority": "High",
    "updatedAt": "2024-02-06T10:00:00Z"
  }
}
```

---

## 🗑️ Delete Task

**DELETE** `/api/tasks/:id`

**Example:**
```
DELETE /api/tasks/65abc123def456789
```

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {}
}
```

---

## 📊 Task Field Values

### Task Fields:
- **Title** (String, Required, Max 255 chars)
- **Description** (String, Optional)
- **Assigned To** (User ObjectId, Required) - User who will do the task
- **Assigned By** (User ObjectId, Auto-filled) - User who created the task
- **Event** (Event ObjectId, Optional) - Related event
- **Due Date** (Date, Optional) - Task deadline
- **Priority** (Enum, Default: Medium)
- **Status** (Enum, Default: Pending)
- **Completed At** (Date, Auto-set when status = Completed)
- **Reminder** (Object, Optional) - **⚠️ Not functional yet**
  - `enabled` (Boolean, Default: false)
  - `time` (Date) - When to send reminder
  - **Note:** Field is stored but notifications are not implemented

### Priority Options:
- `High` - Urgent task
- `Medium` - Standard priority (default)
- `Low` - Low priority

### Status Options:
- `Pending` - Not started (default)
- `In Progress` - Currently working on it
- `Completed` - Task finished
- `Cancelled` - Task cancelled

---

## 🧪 Quick Test Flow (Tasks)

1. **Login as Manager:**
```bash
POST /api/auth/login
{
  "email": "manager@gmail.com",
  "password": "manager123"
}
```

2. **Create Task:**
```bash
POST /api/tasks
{
  "title": "Follow up with leads",
  "description": "Call all qualified leads from event",
  "assignedTo": "USER_ID",
  "event": "EVENT_ID",
  "dueDate": "2024-02-10T18:00:00Z",
  "priority": "High"
}
```
**Note:** Reminder field omitted since notifications are not implemented yet

3. **Get All Tasks:**
```bash
GET /api/tasks
```

4. **Login as Assigned User:**
```bash
POST /api/auth/login
{
  "email": "user@gmail.com",
  "password": "user123"
}
```

5. **View My Tasks:**
```bash
GET /api/tasks
```

6. **Update Task Status:**
```bash
PUT /api/tasks/TASK_ID
{
  "status": "In Progress"
}
```

7. **Mark as Completed:**
```bash
PUT /api/tasks/TASK_ID
{
  "status": "Completed"
}
```

8. **Filter Tasks:**
```bash
GET /api/tasks?status=Pending&priority=High
GET /api/tasks?event=EVENT_ID
```

---

# 🔐 ADMIN APIs

Base URL: `http://localhost:5003/api/tasks`

**Required Permission:** `canViewReports` (Manager/Admin roles)

---

## 📋 View All Tasks (Admin)

**GET** `/api/tasks`

**Query Parameters:**
- `event` - Filter by event ID
- `status` - Filter by status
- `priority` - Filter by priority
- `assignedTo` - Filter by specific user

**Examples:**
```
GET /api/tasks (All users' tasks)
GET /api/tasks?assignedTo=USER_ID
GET /api/tasks?event=EVENT_ID&status=Pending
GET /api/tasks?priority=High&assignedTo=USER_ID
```

**Returns:** **ALL** tasks across all users (no user filtering)

**Response:**
```json
{
  "success": true,
  "count": 85,
  "data": [
    {
      "_id": "65abc123def456789",
      "title": "Follow up with leads",
      "description": "Call all qualified leads",
      "assignedTo": {
        "_id": "USER_ID",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assignedBy": {
        "_id": "MANAGER_ID",
        "name": "Jane Manager",
        "email": "jane@example.com"
      },
      "event": {
        "_id": "EVENT_ID",
        "name": "Tech Expo 2024"
      },
      "dueDate": "2024-02-10T18:00:00Z",
      "priority": "High",
      "status": "Pending",
      "reminder": {
        "enabled": true,
        "time": "2024-02-10T09:00:00Z"
      },
      "createdAt": "2024-02-05T10:00:00Z"
    }
  ]
}
```

---

## 🧪 Quick Test Flow (Admin)

1. **Login as Admin:**
```bash
POST /api/auth/login
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

2. **View All Tasks:**
```bash
GET /api/tasks
```

3. **Filter by User:**
```bash
GET /api/tasks?assignedTo=USER_ID
```

4. **Filter by Status & Event:**
```bash
GET /api/tasks?status=Pending&event=EVENT_ID
```

5. **View Overdue Tasks:**
```bash
GET /api/tasks?status=Pending
(Check dueDate < today in response)
```

---

## 🔑 Key Differences: User vs Admin APIs

| Feature | User APIs | Admin APIs |
|---------|-----------|------------|
| **View Scope** | Tasks assigned/created by them | ALL users' tasks |
| **Create** | ✅ Yes | ✅ Yes |
| **Update** | ✅ Own tasks | ✅ Any task |
| **Delete** | ✅ Own tasks | ✅ Any task |
| **Filter by User** | ❌ No | ✅ Yes |
| **Permission** | Any authenticated user | `canViewReports` required |

---

## ✅ Task Testing Checklist

### User/Mobile APIs:
- [ ] Create task with all fields
- [ ] Create task with only required fields
- [ ] Get all my tasks (assigned to OR created by me)
- [ ] Filter by event
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Get single task
- [ ] Update task status to "In Progress"
- [ ] Update task priority
- [ ] Mark task as completed (check completedAt is set)
- [ ] Delete own task
- [ ] Assign task to another user
- [ ] Enable/disable reminder (⚠️ Note: Won't send actual notifications)
- [ ] Try to view another user's task (should only work if assigned/created by you)

### Admin APIs:
- [ ] View all tasks across all users
- [ ] Filter by specific user (assignedTo)
- [ ] Filter by event
- [ ] Filter by status
- [ ] Filter by priority
- [ ] View, update, delete any task

---

---

# 📊 Dashboard & Reports API Reference

---

## 🎯 API Overview

Base URL: `http://localhost:5003/api/dashboard`

The Dashboard system provides comprehensive statistics and analytics for both admins and users across all modules (events, leads, expenses, attendance, tasks).

---

# 👑 ADMIN DASHBOARD API

## 📊 Get Admin Dashboard Stats

**GET** `/api/dashboard/admin`

**Permission Required:** `canViewReports` (Manager/Admin roles)

**Response:**
```json
{
  "success": true,
  "data": {
    "events": {
      "total": 25,
      "upcoming": 5,
      "live": 3,
      "completed": 17
    },
    "leads": {
      "total": 450,
      "new": 120,
      "converted": 85,
      "conversionRate": 18.89,
      "byEvent": [
        {
          "_id": "EVENT_ID",
          "eventName": "Tech Expo 2024",
          "count": 150
        }
      ]
    },
    "expenses": {
      "total": 125000,
      "pending": 20000,
      "approved": 100000,
      "budget": 200000,
      "budgetUtilization": 50.00,
      "remaining": 100000
    },
    "attendance": {
      "today": 45,
      "total": 1250,
      "present": 1100,
      "absent": 50,
      "byStatus": {
        "Present": 1100,
        "Absent": 50,
        "Half Day": 80,
        "Leave": 20
      }
    }
  }
}
```

### Features:

**Events:**
- Total, upcoming, live, completed event counts

**Leads:**
- Total leads, new leads, converted leads
- Conversion rate percentage
- Top 10 events by lead count

**Expenses vs Budget:**
- Total expenses, pending, approved amounts
- Total budget across all events
- Budget utilization percentage
- Remaining budget

**Attendance:**
- Today's attendance count
- Total attendance records
- Present/Absent counts
- Breakdown by status

---

# 👤 USER DASHBOARD API

## 📊 Get User Dashboard Stats

**GET** `/api/dashboard/user`

**Permission:** Any authenticated user

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
      "recent": [
        {
          "_id": "TASK_ID",
          "title": "Follow up with leads",
          "event": {
            "_id": "EVENT_ID",
            "name": "Tech Expo 2024"
          },
          "dueDate": "2024-02-10T18:00:00Z",
          "priority": "High",
          "status": "Pending",
          "createdAt": "2024-02-05T10:00:00Z"
        }
      ]
    },
    "expenses": [
      {
        "_id": "Pending",
        "totalAmount": 5000,
        "count": 3
      },
      {
        "_id": "Approved",
        "totalAmount": 15000,
        "count": 8
      },
      {
        "_id": "Rejected",
        "totalAmount": 500,
        "count": 1
      }
    ],
    "attendance": {
      "today": {
        "_id": "ATTENDANCE_ID",
        "user": "USER_ID",
        "event": "EVENT_ID",
        "date": "2024-02-05T00:00:00Z",
        "checkIn": {
          "time": "2024-02-05T09:00:00Z",
          "location": {
            "latitude": 28.7041,
            "longitude": 77.1025,
            "address": "Event Venue"
          }
        },
        "status": "Present"
      }
    }
  }
}
```

### Features:

**Event Schedule:**
- List of events assigned to the user
- Includes name, dates, status, location

**Assigned Leads:**
- Total leads assigned to user
- New leads count
- Converted leads count

**Tasks:**
- Pending tasks count
- Recent 10 tasks with details
- Sorted by due date

**Expenses:**
- Breakdown by status (Pending/Approved/Rejected)
- Total amount and count for each status

**Today's Attendance:**
- Full attendance record for today
- Check-in time, location, status
- Null if not checked in yet

---

# 📥 REPORTS EXPORT APIs

---

## 📊 Export Leads

### Export to Excel

**GET** `/api/admin/leads/export/excel`

**Query Parameters (Optional):**
- `source` - Filter by source event ID
- `status` - Filter by status
- `assignedTo` - Filter by assigned user

**Examples:**
```
GET /api/admin/leads/export/excel
GET /api/admin/leads/export/excel?source=EVENT_ID
GET /api/admin/leads/export/excel?status=Converted
GET /api/admin/leads/export/excel?source=EVENT_ID&status=Qualified
```

**Response:** Excel file (.xlsx) with columns:
- Name, Company, Phone, Email, Designation
- Source Event, Priority, Status
- Assigned To, Notes, Follow-ups
- Created At, Updated At

**File Name:** `leads-{timestamp}.xlsx`

---

### Export to CSV

**GET** `/api/admin/leads/export/csv`

Same query parameters and filtering as Excel export.

**Response:** CSV file with same columns

**File Name:** `leads-{timestamp}.csv`

---

### Export to PDF ✅ NEW!

**GET** `/api/admin/leads/export/pdf`

Same query parameters and filtering as Excel export.

**Response:** PDF file with formatted lead report including:
- Report title and generation timestamp
- Total leads count
- Individual lead details with contact info, status, priority
- Source event and assignment information

**File Name:** `leads-{timestamp}.pdf`

---

## 💰 Export Expenses

### Export to Excel ✅ NEW!

**GET** `/api/admin/expenses/export/excel`

**Query Parameters (Optional):**
- `event` - Filter by event ID
- `user` - Filter by user ID
- `status` - Filter by status (Pending/Approved/Rejected)
- `category` - Filter by category (Travel/Food/Stay/Misc)

**Examples:**
```
GET /api/admin/expenses/export/excel
GET /api/admin/expenses/export/excel?status=Approved
GET /api/admin/expenses/export/excel?event=EVENT_ID&status=Pending
GET /api/admin/expenses/export/excel?user=USER_ID
```

**Response:** Excel file (.xlsx) with columns:
- Date, User, Event, Category, Sub-Category
- Description, Amount (₹), Status
- Approved By, Admin Comments

**File Name:** `expenses-{timestamp}.xlsx`

---

### Export to CSV ✅ NEW!

**GET** `/api/admin/expenses/export/csv`

Same query parameters and filtering as Excel export.

**Response:** CSV file with same columns

**File Name:** `expenses-{timestamp}.csv`

---

### Export to PDF ✅ NEW!

**GET** `/api/admin/expenses/export/pdf`

Same query parameters and filtering as Excel export.

**Response:** PDF file with formatted expense report including:
- Report title and generation timestamp
- Summary section with total, pending, and approved amounts
- Individual expense details with user, event, category, amount
- Payment method and approval information

**File Name:** `expenses-{timestamp}.pdf`

---

## 📅 Export Attendance ✅ NEW!

### Export to Excel

**GET** `/api/admin/attendance/export/excel`

**Query Parameters (Optional):**
- `event` - Filter by event ID
- `user` - Filter by user ID
- `status` - Filter by status (Present/Absent/Half Day/Leave)
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)

**Examples:**
```
GET /api/admin/attendance/export/excel
GET /api/admin/attendance/export/excel?user=USER_ID
GET /api/admin/attendance/export/excel?event=EVENT_ID
GET /api/admin/attendance/export/excel?startDate=2024-02-01&endDate=2024-02-28
GET /api/admin/attendance/export/excel?status=Present&event=EVENT_ID
```

**Response:** Excel file (.xlsx) with columns:
- Date, User, Email, Event
- Check-In Time, Check-Out Time, Work Hours
- Status, Location

**File Name:** `attendance-{timestamp}.xlsx`

---

### Export to CSV ✅ NEW!

**GET** `/api/admin/attendance/export/csv`

Same query parameters and filtering as Excel export.

**Response:** CSV file with same columns

**File Name:** `attendance-{timestamp}.csv`

---

### Export to PDF ✅ NEW!

**GET** `/api/admin/attendance/export/pdf`

Same query parameters and filtering as Excel export.

**Response:** PDF file with formatted attendance report including:
- Report title and generation timestamp
- Summary section with total records, present/absent counts, total work hours
- Individual attendance records with user, event, date, times
- Check-in/check-out times, work hours, status, and location

**File Name:** `attendance-{timestamp}.pdf`

---

## 📊 Export Summary

| Report Type | Excel | CSV | PDF |
|-------------|-------|-----|-----|
| **Leads** | ✅ Available | ✅ Available | ✅ Available |
| **Expenses** | ✅ Available | ✅ Available | ✅ Available |
| **Attendance** | ✅ Available | ✅ Available | ✅ Available |
| **Events** | ❌ Not Implemented | ❌ Not Implemented | ❌ Not Implemented |
| **Tasks** | ❌ Not Implemented | ❌ Not Implemented | ❌ Not Implemented |

---

## 🧪 Quick Test Flow

### Test 1: Get Admin Dashboard

```bash
POST /api/auth/login
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
# Copy the token

GET /api/dashboard/admin
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected:** Full dashboard stats including budget comparison

---

### Test 2: Get User Dashboard

```bash
POST /api/auth/login
{
  "email": "user@gmail.com",
  "password": "user123"
}
# Copy the token

GET /api/dashboard/user
Headers:
  Authorization: Bearer YOUR_USER_TOKEN
```

**Expected:** User's assigned leads, tasks, attendance, expenses

---

### Test 3: Export Leads to Excel

```bash
GET /api/admin/leads/export/excel?source=EVENT_ID
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected:** Excel file download

---

### Test 4: Export Expenses to CSV (NEW!)

```bash
GET /api/admin/expenses/export/csv?status=Approved
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected:** CSV file download

---

### Test 5: Export Attendance to Excel (NEW!)

```bash
GET /api/admin/attendance/export/excel?user=USER_ID
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected:** Excel file download

---

## ✅ Dashboard & Reports Testing Checklist

### Admin Dashboard:
- [ ] Get admin dashboard stats
- [ ] Verify events count (total, upcoming, live, completed)
- [ ] Verify leads stats (total, new, converted, conversion rate)
- [ ] Verify leads by event (top 10)
- [ ] Verify expenses vs budget (total, pending, approved, budget, utilization)
- [ ] Verify attendance summary (today, total, present, absent, by status)

### User Dashboard:
- [ ] Get user dashboard stats
- [ ] Verify assigned events list
- [ ] Verify assigned leads count
- [ ] Verify tasks (pending count, recent 10)
- [ ] Verify expenses by status
- [ ] Verify today's attendance

### Export - Leads:
- [ ] Export all leads to Excel
- [ ] Export all leads to CSV
- [ ] Export filtered leads (by source)
- [ ] Export filtered leads (by status)

### Export - Expenses:
- [ ] Export all expenses to Excel
- [ ] Export all expenses to CSV (NEW!)
- [ ] Export filtered expenses (by event)
- [ ] Export filtered expenses (by status)
- [ ] Export filtered expenses (by user)

### Export - Attendance:
- [ ] Export all attendance to Excel (NEW!)
- [ ] Export all attendance to CSV (NEW!)
- [ ] Export filtered attendance (by user)
- [ ] Export filtered attendance (by event)
- [ ] Export filtered attendance (by date range)
- [ ] Export filtered attendance (by status)

---

## 🆕 What's New:

### ✅ Enhanced Admin Dashboard:
- **Budget vs Expenses:** Now includes budget comparison
  - Total budget from all events
  - Budget utilization percentage
  - Remaining budget amount

- **Enhanced Attendance Summary:** Now includes
  - Total attendance records
  - Present/Absent counts
  - Breakdown by all statuses

### ✅ New Export Features:
- **Expenses CSV Export:** Export expenses to CSV format
- **Attendance Excel Export:** Export attendance records to Excel
- **Attendance CSV Export:** Export attendance records to CSV

---

## 📝 Notes:

**PDF Export:**
- ✅ Implemented for Leads, Expenses, and Attendance
- Uses pdfkit library
- Formatted reports with summaries and details

**Event & Task Exports:**
- Not implemented yet
- Can be added if required

**Real-time Updates:**
- Dashboard data is fetched on request
- For real-time updates, implement WebSocket or polling

**Performance:**
- All queries are optimized with indexes
- Large exports may take time (10+ seconds for 10,000+ records)

---


