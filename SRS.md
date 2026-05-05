
# Software Requirements Specification (SRS)
## SmartCare — Hospital Search, Comparison & Appointment Booking Platform

**Version:** 1.0  
**Date:** May 2026  
**Prepared by:** SmartCare Development Team

---

## Table of Contents

1. Introduction
2. Overall Description
3. System Architecture
4. Functional Requirements
5. Non-Functional Requirements
6. Database Design
7. API Specification
8. User Interface Requirements
9. Security Requirements
10. Deployment & Configuration

---

## 1. Introduction

### 1.1 Purpose
This document describes the complete software requirements for **SmartCare**, a full-stack web application that enables users to search, compare, and book appointments at hospitals in Maharashtra, India. It also includes an admin portal for hospital management and a payment gateway integration.

### 1.2 Scope
SmartCare provides:
- Hospital discovery and comparison
- Doctor profiles and specialty search
- Online appointment booking with Razorpay payment
- Admin portal for managing hospitals, doctors, services, users, appointments, and payments
- Doctor portal for viewing appointment schedules
- User profile management

### 1.3 Definitions

| Term | Definition |
|---|---|
| User | A registered patient who books appointments |
| Admin | A super_admin or admin who manages the platform |
| Hospital | A healthcare facility listed on the platform |
| Doctor | A medical professional associated with a hospital |
| Service | A medical procedure or treatment offered by a hospital |
| Appointment | A booking made by a user with a doctor |
| Payment | A Razorpay transaction linked to an appointment |
| JWT | JSON Web Token used for authentication |
| Atlas | MongoDB cloud database service |

### 1.4 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4 |
| UI Components | Radix UI (53 components), Lucide Icons |
| Routing | Wouter 3.3.5 |
| State Management | React Context API |
| Backend | Node.js, Express 4.21.2, TypeScript |
| Database | MongoDB with Mongoose 9.5.0 |
| Authentication | JWT (jsonwebtoken), bcryptjs |
| Payment | Razorpay Node SDK |
| Package Manager | pnpm |
| Build Tool | Vite (frontend), esbuild (backend) |

---

## 2. Overall Description

### 2.1 Product Perspective
SmartCare is a monorepo web application with three main parts:
- `/client` — React single-page application
- `/server` — Express REST API
- `/database` — MongoDB models and seed scripts

### 2.2 User Classes

**Guest (Unauthenticated)**
- Browse hospitals and doctors
- Use cost calculator and comparison tools
- View hospital details

**Registered User**
- All guest capabilities
- Book appointments with payment
- View personal appointment history
- Edit profile and profile photo

**Admin / Super Admin**
- Full CRUD on hospitals, doctors, services
- Manage users and appointments
- View all payment transactions
- Access admin dashboard with analytics

**Doctor (via Doctor Portal)**
- View their appointment schedule
- See patient details for booked appointments

### 2.3 Operating Environment
- Modern web browsers (Chrome, Firefox, Safari, Edge)
- Node.js v18+ runtime
- MongoDB Atlas (cloud) or local MongoDB
- Internet connection required for Razorpay payments

---

## 3. System Architecture

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (React)                    │
│  Port 3000 — Vite Dev Server                        │
│  Proxies /api → localhost:3001                      │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────┐
│                 SERVER (Express)                     │
│  Port 3001 — REST API                               │
│  Routes: /api/auth, /api/hospitals,                 │
│          /api/appointments, /api/payments,           │
│          /api/users                                  │
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────┐
│              DATABASE (MongoDB Atlas)                │
│  Collections: users, admins, hospitals,             │
│               doctors, services,                    │
│               appointments, payments                 │
└─────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              RAZORPAY (Payment Gateway)              │
│  Test Mode: rzp_test_SkCF8SuhtObi2q                 │
│  Supports: UPI, Cards, Net Banking, Wallets         │
└─────────────────────────────────────────────────────┘
```

### 3.2 Folder Structure

```
smartcare/
├── client/src/
│   ├── App.tsx              # Router — all 23 routes defined here
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # 53 Radix UI primitives
│   │   ├── Navbar.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── BookAppointmentModal.tsx
│   │   ├── DoctorCard.tsx
│   │   ├── HospitalCard.tsx
│   │   ├── ImageUpload.tsx
│   │   └── PayNowButton.tsx
│   ├── contexts/            # Global state
│   │   ├── UserContext.tsx  # User auth + profile
│   │   ├── AdminContext.tsx # Admin auth
│   │   └── HospitalContext.tsx # Compare list
│   ├── hooks/
│   │   └── useRazorpay.ts   # Payment hook
│   ├── lib/
│   │   ├── api.ts           # All fetch functions
│   │   └── utils.ts         # Filter/sort helpers
│   ├── pages/               # 23 page components
│   └── data/
│       ├── hospitals.ts     # TypeScript interfaces
│       └── images.ts        # Hospital/doctor image URLs
├── server/
│   ├── index.ts             # Express app entry point
│   └── routes/
│       ├── auth.ts
│       ├── hospitals.ts
│       ├── users.ts
│       ├── appointments.ts
│       └── payments.ts
├── database/
│   ├── connect.ts
│   ├── seed.ts              # Seeds 20 hospitals, 5 users, 1 admin
│   └── models/              # 7 Mongoose models
└── .env                     # Environment variables
```

---

## 4. Functional Requirements

### 4.1 Authentication Module

**FR-AUTH-01: User Registration**
- User provides: full name, email, phone, password (min 6 chars), confirm password
- System validates email uniqueness
- Password hashed with bcrypt (10 rounds)
- JWT token issued on success (7-day expiry)
- User redirected to home page

**FR-AUTH-02: User Login**
- User provides email and password
- System checks `users` collection first, then `admins` collection
- On success: JWT token stored in localStorage
- Admin users redirected to `/admin/dashboard`
- Regular users redirected to `/`

**FR-AUTH-03: Admin Login**
- Separate page at `/admin/login`
- Checks `admins` collection only
- JWT includes role (`admin` or `super_admin`)

**FR-AUTH-04: Session Persistence**
- JWT and user data stored in `localStorage`
- Restored on page refresh via `useEffect` in `UserContext`
- Logout clears localStorage and resets state

---

### 4.2 Hospital Module

**FR-HOSP-01: Hospital Listing**
- Display all 20 hospitals in grid or list view
- Each card shows: image, name, level badge, rating, distance, beds, specialties
- Default sort: by rating (descending)

**FR-HOSP-02: Search & Filter**
- Text search across name, address, specialties
- Filter by: level (Premium/Standard/Basic), facilities, max distance, min rating
- Sort by: rating, distance, AI score
- "Near Me" button sorts by distance using browser geolocation

**FR-HOSP-03: Hospital Detail Page**
- Hero image with gradient overlay
- Tabs: Overview, Doctors, Services, Timeline, Reviews
- Overview: bed count, ICU beds, OTs, facilities, specialties, insurance
- Doctors tab: doctor cards with photo, specialty, fee, availability
- Services tab: pricing table with estimated stay
- "Book Appointment" button opens booking modal

**FR-HOSP-04: Hospital Comparison**
- Add up to 4 hospitals to compare list
- Side-by-side comparison table: rating, distance, level, beds, ICU, OTs, AI score, facilities, insurance

---

### 4.3 Appointment Module

**FR-APT-01: Book Appointment (4-step flow)**
- Step 1: Select doctor (shows name, specialty, experience, fee, rating)
- Step 2: Pick date (min: today) and time slot (14 slots from 9AM–5PM)
- Step 3: Enter reason for visit
- Step 4: Review summary → Pay with Razorpay

**FR-APT-02: Payment on Booking**
- Appointment saved to DB before payment
- Razorpay popup opens with SmartCare branding
- On success: payment verified, billing page shown
- On failure: appointment saved as unpaid, error shown

**FR-APT-03: Billing Page**
- Unique bill number (format: `SC` + 8 digits)
- Shows: patient name, mobile, email, doctor, hospital, date, time, amount paid, payment ID
- Print and Download (text file) buttons

**FR-APT-04: My Appointments**
- User views all their appointments
- Tabs: All, Upcoming, Completed, Cancelled
- Shows: doctor, hospital, date, time, status badge, doctor's notes

**FR-APT-05: Admin Appointment Management**
- View all appointments with status filters
- Confirm, cancel, or mark complete
- Add notes for patient
- Create appointments manually (admin-created)

---

### 4.4 Payment Module

**FR-PAY-01: Create Razorpay Order**
- Backend creates order via Razorpay API
- Amount converted from ₹ to paise (×100)
- Order stored in `payments` collection with status `CREATED`

**FR-PAY-02: Payment Verification**
- Frontend sends `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
- Backend verifies HMAC-SHA256 signature using key secret
- Status updated to `SUCCESS` or `FAILED`

**FR-PAY-03: Webhook Support**
- Endpoint: `POST /api/payments/webhook`
- Handles `payment.captured` and `payment.failed` events
- Signature verified using `RAZORPAY_WEBHOOK_SECRET`

**FR-PAY-04: Admin Payments Dashboard**
- Total revenue (sum of SUCCESS payments)
- Count of successful, failed, pending payments
- Filter by: status, date range
- Table: order ID, user, description, amount, status, payment ID, date

---

### 4.5 User Profile Module

**FR-PROF-01: View Profile**
- Shows avatar, name, email, phone
- Stats: total, upcoming, completed, cancelled appointments
- Appointment history with tabs

**FR-PROF-02: Edit Profile**
- Edit name and phone number
- Change profile photo (file upload or URL)
- Email cannot be changed
- Changes saved to MongoDB and localStorage

---

### 4.6 Admin Module

**FR-ADMIN-01: Dashboard**
- Stats: total hospitals, doctors, services, active users
- Recent hospitals list with ratings
- Platform stats: average rating, total beds, ICU beds

**FR-ADMIN-02: Hospital Management**
- List with image thumbnail, name, level, beds, ICU, OTs
- Add hospital: name, address, phone, level, beds, ICU, OTs, image upload
- Edit existing hospital details
- Delete hospital

**FR-ADMIN-03: Doctor Management**
- List with photo, name, specialty, experience, fee, rating, hospital
- Add doctor: name, specialty, experience, fee, rating, hospital, photo
- Edit and delete doctors

**FR-ADMIN-04: Service Management**
- List with service name, category, base price, estimated stay, hospital
- Add, edit, delete services

**FR-ADMIN-05: User Management**
- List with avatar, name, email, phone, status, appointments, join date
- Add user: name, email, phone, password, status, profile photo
- View user details modal
- Delete user

**FR-ADMIN-06: Doctor Portal**
- Public page at `/doctor-portal`
- Search doctors by name, specialty, hospital
- Select doctor to view their appointment schedule
- Tabs: Today, Upcoming, All appointments
- Shows patient name, contact, reason, status, notes

---

### 4.7 Comparison Tools

**FR-COMP-01: Hospital Comparison** — Side-by-side table up to 4 hospitals  
**FR-COMP-02: Services Comparison** — Compare service prices across hospitals  
**FR-COMP-03: Doctors Comparison** — Compare doctors by specialty  
**FR-COMP-04: Facilities Comparison** — Checkbox matrix of facilities  
**FR-COMP-05: Cost Calculator** — Select treatment, adjust daily charges, see total cost per hospital

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Hospital listing page loads in under 2 seconds
- API responses under 500ms for standard queries
- Images lazy-loaded with fallback URLs

### 5.2 Scalability
- MongoDB Atlas auto-scales storage
- Stateless JWT authentication supports horizontal scaling
- Vite production build optimized with code splitting

### 5.3 Usability
- Fully responsive — works on mobile, tablet, desktop
- Accessible color contrast (primary teal `#0d9488`)
- Loading states on all async operations
- Error messages shown inline (no alerts)

### 5.4 Reliability
- MongoDB Atlas provides 99.95% uptime SLA
- Razorpay handles payment retries
- Appointment saved before payment — no data loss on payment failure

### 5.5 Maintainability
- TypeScript throughout — full type safety
- Shared interfaces in `client/src/data/hospitals.ts`
- All API calls centralized in `client/src/lib/api.ts`
- Environment variables for all secrets

---

## 6. Database Design

### 6.1 Collections

#### users
```
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, lowercase),
  phone: String (required),
  passwordHash: String (required),
  status: "Active" | "Inactive",
  appointments: Number (default: 0),
  joinDate: Date,
  image: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

#### admins
```
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, lowercase),
  passwordHash: String (required),
  role: "admin" | "super_admin",
  createdAt: Date,
  updatedAt: Date
}
```

#### hospitals
```
{
  _id: ObjectId,
  name: String (required, text-indexed),
  address: String (required),
  city: String (required, indexed, text-indexed),
  distance: Number,
  rating: Number (0–5),
  reviews: Number,
  beds: Number,
  icuBeds: Number,
  ots: Number,
  level: "Premium" | "Standard" | "Basic" (indexed),
  facilities: [String],
  specialties: [String] (text-indexed),
  insurance: [String],
  aiScore: Number (0–100),
  bestFor: [String],
  image: String,
  images: [String],
  phone: String,
  email: String,
  website: String
}
```

#### doctors
```
{
  _id: ObjectId,
  hospitalId: ObjectId (ref: Hospital, indexed),
  name: String,
  specialty: String,
  experience: Number,
  rating: Number (0–5),
  availability: String,
  consultationFee: Number,
  image: String
}
```

#### services
```
{
  _id: ObjectId,
  hospitalId: ObjectId (ref: Hospital, indexed),
  name: String,
  category: String,
  basePrice: Number,
  estimatedStay: Number,
  description: String
}
```

#### appointments
```
{
  _id: ObjectId,
  userId: String (indexed),
  userName: String,
  userEmail: String,
  userPhone: String,
  hospitalId: ObjectId,
  hospitalName: String,
  doctorId: String,
  doctorName: String,
  doctorSpecialty: String,
  date: String (YYYY-MM-DD),
  time: String,
  reason: String,
  status: "pending" | "confirmed" | "cancelled" | "completed",
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### payments
```
{
  _id: ObjectId,
  userId: String (indexed),
  userName: String,
  userEmail: String,
  orderId: String (unique),
  paymentId: String,
  signature: String,
  amount: Number (in paise),
  currency: String (default: "INR"),
  description: String,
  appointmentId: String,
  status: "CREATED" | "SUCCESS" | "FAILED",
  createdAt: Date,
  updatedAt: Date
}
```

---

## 7. API Specification

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://your-domain.com/api`

### Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

### 7.1 Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | User/admin login |
| POST | `/auth/admin/login` | No | Admin-only login |

**POST /auth/register — Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "password": "user1234"
}
```
**Response 201:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "phone": "+91 98765 43210" }
}
```

### 7.2 Hospital Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/hospitals` | No | List hospitals |
| GET | `/hospitals/:id` | No | Hospital detail |
| PATCH | `/hospitals/:id` | No | Update images |

**GET /hospitals — Query params:**
- `?search=cardiology` — text search
- `?level=Premium` — filter by level
- `?city=Pune` — filter by city

### 7.3 Appointment Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/appointments` | User | Book appointment |
| GET | `/appointments/my` | User | My appointments |
| GET | `/appointments` | Admin | All appointments |
| POST | `/appointments/admin` | Admin | Create manually |
| PATCH | `/appointments/:id` | Admin | Update status |
| GET | `/appointments/doctor/:id` | User | Doctor's schedule |

### 7.4 Payment Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/payments/create-order` | User | Create Razorpay order |
| POST | `/payments/verify` | User | Verify payment |
| POST | `/payments/webhook` | No | Razorpay webhook |
| GET | `/payments/my` | User | My payments |
| GET | `/payments` | Admin | All payments |

---

## 8. User Interface Requirements

### 8.1 Pages

| Route | Page | Access |
|---|---|---|
| `/` | Home — hero, top hospitals, AI recommendations | Public |
| `/hospitals` | Hospital listing with filters + Near Me | Public |
| `/hospital/:id` | Hospital detail with tabs | Public |
| `/compare` | Hospital comparison table | Public |
| `/compare/services` | Service price comparison | Public |
| `/compare/doctors` | Doctor comparison by specialty | Public |
| `/compare/facilities` | Facilities matrix | Public |
| `/calculator` | Treatment cost calculator | Public |
| `/login` | User login | Public |
| `/register` | User registration | Public |
| `/profile` | User profile + appointments | Auth |
| `/my-appointments` | Appointment history | Auth |
| `/doctor-portal` | Doctor schedule viewer | Public |
| `/billing` | Post-payment invoice | Auth |
| `/admin/login` | Admin login | Public |
| `/admin/dashboard` | Admin overview | Admin |
| `/admin/hospitals` | Manage hospitals | Admin |
| `/admin/doctors` | Manage doctors | Admin |
| `/admin/services` | Manage services | Admin |
| `/admin/appointments` | Manage appointments | Admin |
| `/admin/payments` | Payment transactions | Admin |
| `/admin/users` | Manage users | Admin |

### 8.2 Design System
- **Primary color:** Teal `#0d9488`
- **Font:** Inter (body), Poppins (headings)
- **Border radius:** `rounded-xl` (12px) for cards
- **Shadows:** `shadow-sm` for cards, `shadow-lg` for modals
- **Responsive breakpoints:** sm (640px), md (768px), lg (1024px)

---

## 9. Security Requirements

### 9.1 Authentication Security
- Passwords hashed with bcrypt, 10 salt rounds
- JWT secret stored in environment variable only
- Tokens expire after 7 days
- No credentials stored in frontend code

### 9.2 Payment Security
- Razorpay secret key never sent to frontend
- Payment signature verified server-side using HMAC-SHA256
- Webhook signature verified before processing
- All payment keys in `.env` only

### 9.3 API Security
- CORS restricted to `http://localhost:3000` in development
- Role-based access: admin endpoints check `req.userRole`
- Input validation on all POST/PATCH endpoints
- MongoDB injection prevented by Mongoose schema validation

### 9.4 Data Security
- `.env` file in `.gitignore` — never committed
- MongoDB Atlas IP whitelist configured
- Sensitive fields excluded from API responses (`passwordHash`)

---

## 10. Deployment & Configuration

### 10.1 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` / `production` |
| `JWT_SECRET` | JWT signing secret | `random_long_string` |
| `RAZORPAY_KEY_ID` | Razorpay public key | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | `...` |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook verification | `...` |

### 10.2 Development Setup

```bash
# Install dependencies
pnpm install

# Seed database
pnpm db:seed

# Terminal 1 — API server (port 3001)
pnpm dev:server

# Terminal 2 — Frontend (port 3000)
pnpm dev
```

### 10.3 Production Build

```bash
# Build frontend + backend
pnpm build

# Start production server
pnpm start
```

### 10.4 Deployment (Render)

1. Push code to GitHub
2. Create Web Service on render.com
3. Build command: `pnpm build`
4. Start command: `node dist/index.js`
5. Add all environment variables in Render dashboard
6. Deploy

### 10.5 Seed Data

The seed script (`pnpm db:seed`) populates:
- **20 hospitals** in Pune, Maharashtra with doctors and services
- **5 users** (password: `user123`)
- **1 admin** (`admin@smartcare.com` / `admin1234`)

---

## Appendix A — Hospital Data (20 Hospitals)

| # | Hospital | Level | Beds | Specialties |
|---|---|---|---|---|
| 1 | Apollo Hospitals | Premium | 450 | Cardiology, Obstetrics, Orthopedics |
| 2 | Lilavati Hospital | Premium | 380 | Neurology, Pediatrics, Cardiology |
| 3 | Ruby Hall Clinic | Standard | 320 | Orthopedics, Dermatology |
| 4 | Deenanath Mangeshkar Hospital | Standard | 280 | General Surgery |
| 5 | Inamdar Hospital | Basic | 220 | Internal Medicine |
| 6 | Jehangir Hospital | Premium | 350 | Oncology, Gastroenterology |
| 7 | Fortis Hospital Pune | Premium | 400 | Cardiology, Neurology, Transplant |
| 8 | Sahyadri Hospital | Standard | 300 | Gynecology, Pediatrics |
| 9 | KEM Hospital | Standard | 600 | General Medicine, Surgery |
| 10 | Poona Hospital | Standard | 250 | Nephrology, Urology |
| 11 | Medipoint Hospital | Standard | 200 | Spine Surgery, Sports Medicine |
| 12 | Inlaks & Budhrani Hospital | Premium | 280 | Oncology, Cardiology |
| 13 | Aditya Birla Memorial Hospital | Premium | 420 | Transplant, Pediatric ICU |
| 14 | Noble Hospital | Standard | 240 | ENT, Gynecology |
| 15 | Sanjeevan Hospital | Basic | 180 | General Practice, Dermatology |
| 16 | Surya Mother & Child Care | Standard | 150 | Obstetrics, Neonatology |
| 17 | Oyster & Pearl Hospital | Standard | 200 | Physiotherapy, Rheumatology |
| 18 | Lokmanya Hospital | Standard | 260 | General Surgery, Nephrology |
| 19 | Pune Institute of Medical Sciences | Premium | 310 | Gastroenterology, Oncology |
| 20 | Bharati Hospital | Standard | 700 | Psychiatry, General Medicine |

---

*End of SRS Document*
