# Road Condition Reporting Application

A comprehensive web application for reporting and managing road condition issues. Users can submit complaints about road problems, and administrators can review, manage, and track the resolution of these issues.

## Project Overview

This is **Version 1** of the Road Condition Reporting App with the following capabilities:

### User Features
- User registration and authentication
- Submit road condition complaints with images
- Track complaint status
- View complaint history

### Admin Features
- Dedicated admin login
- View and manage all complaints
- Filter complaints by status and category
- Update complaint status
- Add remarks to complaints
- View analytics dashboard

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS |
| State Management | Zustand |
| Backend | Node.js + Express.js + TypeScript |
| Database | SQLite with Prisma ORM |
| Authentication | JWT + bcrypt |
| File Upload | Multer (local storage) |

## Project Structure

```
road-condition-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── constants.ts       # Shared constants
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── complaintController.ts
│   │   │   └── adminController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT authentication
│   │   │   ├── upload.ts          # File upload handling
│   │   │   └── validation.ts      # Request validation
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── complaintRoutes.ts
│   │   │   └── adminRoutes.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── errorHandler.ts
│   │   ├── seed.ts                # Database seeding
│   │   └── server.ts              # Main entry point
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/            # Layout components
│   │   │   └── ui/                # Reusable UI components
│   │   ├── pages/
│   │   │   ├── auth/              # Authentication pages
│   │   │   ├── user/              # User pages
│   │   │   └── admin/             # Admin pages
│   │   ├── services/
│   │   │   └── api.ts             # API client
│   │   ├── store/
│   │   │   └── authStore.ts       # Auth state management
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd student-feedback-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Generate Prisma client
   npm run db:generate
   
   # Create database and run migrations
   npm run db:push
   
   # Seed the database with test data
   npm run db:seed
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   Server runs at: http://localhost:5000

2. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   App runs at: http://localhost:3000

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@roadcondition.app | admin123 |
| User | user@example.com | user1234 |

⚠️ **Change these credentials in production!**

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890"  // optional
}

Response:
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "jwt_token",
    "user": { "id", "email", "name", "role" }
  }
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@roadcondition.app",
  "password": "admin123"
}
```

#### Request Password Reset
```http
POST /api/auth/password-reset/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/auth/password-reset
Content-Type: application/json

{
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Complaint Endpoints (User)

#### Create Complaint
```http
POST /api/complaints
Authorization: Bearer <token>
Content-Type: multipart/form-data

category: "pothole"
title: "Large pothole on Main St" (optional)
description: "There is a dangerous pothole..."
address: "123 Main Street, Near Oak Avenue"
images: [file1, file2, ...] (1-5 images required)

Response:
{
  "success": true,
  "message": "Complaint submitted successfully",
  "data": {
    "complaintId": "RC-20260423-0001",
    "message": "Complaint submitted successfully",
    "submittedAt": "2026-04-23T10:30:00.000Z"
  }
}
```

#### Get My Complaints
```http
GET /api/complaints?status=Submitted&category=pothole&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Complaint Detail
```http
GET /api/complaints/:id
Authorization: Bearer <token>
```

#### Get Complaint Status
```http
GET /api/complaints/:id/status
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get Analytics
```http
GET /api/admin/analytics
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "totalComplaints": 100,
    "pendingComplaints": 45,
    "resolvedComplaints": 40,
    "rejectedComplaints": 15,
    "complaintsByCategory": [...],
    "complaintsByStatus": [...]
  }
}
```

#### Get All Complaints
```http
GET /api/admin/complaints?status=Submitted&category=pothole&page=1&limit=10
Authorization: Bearer <admin_token>
```

#### Get Complaint Detail 
```http
GET /api/admin/complaints/:id
Authorization: Bearer <admin_token>
```

#### Update Complaint Status
```http
PATCH /api/admin/complaints/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "Under Review",
  "adminRemarks": "Looking into this issue" // optional, required for rejection
}
```

#### Accept Complaint
```http
POST /api/admin/complaints/:id/accept
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "remarks": "Valid complaint, proceeding to review" // optional
}
```

#### Reject Complaint
```http
POST /api/admin/complaints/:id/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "remarks": "Invalid or spam complaint" // required
}
```

#### Add Remarks
```http
PATCH /api/admin/complaints/:id/remarks
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "remarks": "Work assigned to contractor"
}
```

## Database Schema

### User Model
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique, user email |
| password | String | Hashed password |
| name | String | User's full name |
| phone | String? | Optional phone number |
| role | String | USER or ADMIN |
| createdAt | DateTime | Account creation date |

### Complaint Model
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| complaintId | String | Human-readable ID (RC-YYYYMMDD-XXXX) |
| category | String | Issue category |
| title | String? | Optional issue title |
| description | String | Detailed description |
| address | String | Manual address/location |
| status | String | Current status |
| adminRemarks | String? | Admin notes |
| userId | UUID | Foreign key to User |
| createdAt | DateTime | Submission date |
| updatedAt | DateTime | Last update date |

### ComplaintImage Model
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| filename | String | Stored filename |
| originalName | String | Original uploaded name |
| mimeType | String | File MIME type |
| size | Int | File size in bytes |
| path | String | Relative storage path |
| complaintId | UUID | Foreign key to Complaint |

## Fixed Categories

| Category | Display Name |
|----------|--------------|
| pothole | Pothole |
| crack | Crack |
| waterlogging | Waterlogging |
| debris on road | Debris on Road |
| damaged signboard | Damaged Signboard |
| damaged divider | Damaged Divider |
| blocked drainage | Blocked Drainage |

## Complaint Statuses

| Status | Description |
|--------|-------------|
| Submitted | Initial state after user submits |
| Under Review | Admin is reviewing the complaint |
| Assigned | Assigned to relevant department/team |
| In Progress | Work is ongoing to resolve |
| Resolved | Issue has been fixed |
| Rejected | Invalid or spam complaint |

## Status Transition Rules

```
Submitted → Under Review, Rejected
Under Review → Assigned, Rejected
Assigned → In Progress, Under Review, Rejected
In Progress → Resolved, Assigned, Rejected
Resolved → (terminal - no transitions)
Rejected → (terminal - no transitions)
```

## Pending Complaints Definition

**Pending Complaints** = All complaints that are NOT in a terminal state:
- Submitted
- Under Review
- Assigned
- In Progress

## Validation Rules

### User Registration
| Field | Rule |
|-------|------|
| email | Valid email format, unique |
| password | 8-100 characters |
| name | 2-100 characters |
| phone | Optional, valid phone format |

### Complaint Creation
| Field | Rule |
|-------|------|
| category | Required, must be valid category |
| title | Optional, max 200 characters |
| description | 10-2000 characters |
| address | 10-500 characters |
| images | 1-5 images required |

### Image Upload
| Rule | Value |
|------|-------|
| Max file size | 5MB |
| Allowed types | JPEG, PNG, WebP, GIF |
| Max files per upload | 5 |

## Error Handling

All API responses follow this format:

```json
// Success
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Email is required" }
  ]
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 500 | Server Error |

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
DATABASE_URL="file:./dev.db"
MAX_FILE_SIZE_MB=5
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif
UPLOAD_DIR=uploads
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Security Considerations

1. **Password Security**: Passwords are hashed using bcrypt with 12 salt rounds
2. **JWT Tokens**: Tokens expire after 7 days by default
3. **Role Protection**: Admin routes are protected and require ADMIN role
4. **Ownership Checks**: Users can only view their own complaints
5. **File Validation**: Uploaded files are validated for type and size
6. **Input Validation**: All inputs are validated on both frontend and backend

## Implementation Decisions

1. **SQLite Database**: Chosen for simplicity in Version 1. Easy to migrate to PostgreSQL for production.

2. **Local File Storage**: Images stored locally in `uploads/` directory. For production, consider cloud storage (S3, Cloudinary).

3. **Password Reset**: In development, reset tokens are logged to console. For production, integrate email service.

4. **Complaint ID Format**: Uses format `RC-YYYYMMDD-XXXX` for human-readable IDs.

5. **No GPS/Maps**: Location is manual text input only in Version 1.

6. **Authentication**: JWT stored in localStorage. Consider httpOnly cookies for enhanced security in production.

7. **Concurrent Updates**: Basic handling through Prisma transactions. Consider optimistic locking for high-traffic production.

## Test Scenarios Checklist

### Authentication
- [x] User registration with valid data
- [x] Registration with duplicate email shows error
- [x] Registration with invalid email format shows error
- [x] Registration with weak password shows error
- [x] User login with valid credentials
- [x] User login with invalid credentials shows error
- [x] Admin login with valid credentials
- [x] Admin login as regular user shows error
- [x] Logout clears session
- [x] Password reset flow

### Complaint Creation
- [x] Submit complaint with all required fields
- [x] Submit without image shows error
- [x] Submit with invalid category shows error
- [x] Submit with too short description shows error
- [x] Submit with oversized image shows error
- [x] Submit with invalid file type shows error
- [x] Multiple image upload works
- [x] Confirmation shows complaint ID

### Complaint Viewing (User)
- [x] View own complaints list
- [x] View complaint details
- [x] Filter by status works
- [x] Filter by category works
- [x] Empty state shown when no complaints
- [x] Cannot view other users' complaints

### Admin Dashboard
- [x] Analytics show correct counts
- [x] View all complaints
- [x] Filter complaints works
- [x] View complaint details
- [x] View complaint images
- [x] Accept complaint changes status
- [x] Reject requires remarks
- [x] Update status with valid transition
- [x] Invalid status transition blocked
- [x] Add remarks to complaint

### Edge Cases
- [x] Handle empty complaint history
- [x] Handle all complaints resolved
- [x] Handle all complaints rejected
- [x] Handle category with no complaints
- [x] Handle broken image gracefully
- [x] Handle expired JWT token
- [x] Handle network errors

## Known Limitations (Version 1)

1. No GPS or map integration
2. No push notifications
3. No email notifications (placeholder only)
4. No offline mode
5. No duplicate complaint detection
6. No advanced analytics/charts
7. Single file storage location
8. No multi-language support

## Future Enhancements (Version 2+)

- GPS-based location capture
- Map integration for visualization
- Push/email notifications
- AI-based issue detection
- Field staff assignment workflow
- Advanced analytics dashboard
- Offline mode support
- Multi-language support

## License

MIT License
