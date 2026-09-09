# Clinic Management System

A backend REST API for managing clinic operations, built with NestJS, Prisma, and SQLite. Demonstrates role-based access control, JWT authentication, and automatic audit logging.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript |
| ORM | Prisma 7 |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT (passport-jwt) |
| Password Hashing | bcrypt |

## Architecture Decisions

### 1. Soft Delete on Users and Patients
Users and Patients are never hard deleted — they are deactivated via `isActive: false`. Hard deleting a patient would orphan their appointment and prescription history, breaking referential integrity. Soft delete preserves the full medical record trail.

### 2. Prescription Linked to Appointment, Not Patient
A prescription is always issued during an appointment. Rather than storing `patientId` and `doctorId` directly on the Prescription, both are reachable through the Appointment FK. This eliminates data duplication and enforces a single source of truth.

### 3. Audit Logging on Reads of Sensitive Records
All mutations (CREATE, UPDATE, DELETE) are logged automatically. Additionally, reads on patient records and prescriptions are logged — in a healthcare context, who accessed sensitive data is as important as who changed it.

### 4. Doctor-Only Prescription Ownership
Only Doctors can create or modify prescriptions. Pharmacists can view them for drug interaction checking but cannot alter them. This maintains clear ownership and a clean audit trail.

### 5. 8-Hour JWT Expiration
Token expiration is tied to a clinic shift length. When the shift ends, the token expires and staff must re-authenticate.

### 6. Interceptor-Based Audit Logging
Audit logging is implemented as a NestJS Interceptor with a custom `@Audit()` decorator. This means zero manual logging calls in any service — the interceptor wraps the route automatically and logs only where the decorator is applied.

## Roles & Permissions

| Operation | Admin | Front Desk | Doctor | Pharmacist |
|---|---|---|---|---|
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Create/Update Patients | ❌ | ✅ | ❌ | ❌ |
| View Patients | ✅ | ✅ | ✅ | ✅ |
| Delete Patients | ✅ | ❌ | ❌ | ❌ |
| Create/Update Appointments | ❌ | ✅ | ❌ | ❌ |
| View Appointments | ✅ | ✅ | ✅ | ❌ |
| Create/Update/Delete Prescriptions | ❌ | ❌ | ✅ | ❌ |
| View Prescriptions | ✅ | ❌ | ✅ | ✅ |

## Getting Started

### Prerequisites
- Node.js v18+
- npm

### Installation

```bash
git clone https://github.com/AbdulbariAlsh/clinic-management.git
cd clinic-management
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run start:dev
```

### Environment Variables
Create a `.env` file in the project root:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_secret_key_here
```

### Default Admin Account
```
Email: admin@clinic.com
Password: admin123
```

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /auth/login | Public | Login and receive JWT token |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /users | Admin | Create a new user |
| GET | /users | Admin | List all users |
| GET | /users/:id | Admin | Get a user by ID |
| PATCH | /users/:id | Admin | Update a user |
| DELETE | /users/:id | Admin | Deactivate a user (soft delete) |

### Patients
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /patients | Front Desk | Register a new patient |
| GET | /patients | All roles | List all active patients |
| GET | /patients/:id | All roles | Get patient details (audited) |
| PATCH | /patients/:id | Front Desk | Update patient info |
| DELETE | /patients/:id | Admin | Deactivate a patient (soft delete) |

### Appointments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /appointments | Front Desk | Book an appointment |
| GET | /appointments | Admin, Front Desk, Doctor | List all appointments |
| GET | /appointments/:id | Admin, Front Desk, Doctor | Get appointment details |
| PATCH | /appointments/:id | Front Desk | Update appointment |
| DELETE | /appointments/:id | Admin, Front Desk | Cancel appointment |

### Prescriptions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /prescriptions | Doctor | Issue a prescription |
| GET | /prescriptions | Admin, Doctor, Pharmacist | List all prescriptions |
| GET | /prescriptions/:id | Admin, Doctor, Pharmacist | Get prescription details (audited) |
| PATCH | /prescriptions/:id | Doctor | Update a prescription |
| DELETE | /prescriptions/:id | Doctor | Delete a prescription |

## Audit Log

Audit logs are written automatically via a NestJS interceptor. No manual logging calls exist in any service.

| Trigger | Action logged |
|---|---|
| Any CREATE | Action, entity, after-state JSON snapshot |
| Any UPDATE | Action, entity, after-state JSON snapshot |
| Any DELETE | Action, entity, entity ID |
| GET /patients/:id | READ action logged |
| GET /prescriptions/:id | READ action logged |
