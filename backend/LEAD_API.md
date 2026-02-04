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



