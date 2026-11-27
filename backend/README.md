# Dinail.co — Backend API Service

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.3-000000?style=flat-square)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat-square)](https://www.prisma.io/)
[![Database](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square)](https://supabase.com/)
[![Auth](https://img.shields.io/badge/Auth-Firebase_Admin-FFCA28?style=flat-square&labelColor=555555&color=FFA000)](https://firebase.google.com/)
[![AI Gateway](https://img.shields.io/badge/AI_Gateway-FastAPI_Proxy-009688?style=flat-square)](https://fastapi.tiangolo.com/)

Backend RESTful API service for **Dinail.co** (Team A26-CS222), managing authentication synchronization, product catalog delivery, custom consultation orders, and acting as an API gateway proxying hand photographs to a computer vision microservice for coin reference detection and fingernail scale estimation.

---

## Table of Contents

1. [Architecture & Request Lifecycle](#1-architecture--request-lifecycle)
2. [Prerequisites & Environment Configuration](#2-prerequisites--environment-configuration)
3. [Database Architecture & Models](#3-database-architecture--models)
4. [API Reference](#4-api-reference)
   - [System Diagnostics](#a-system-diagnostics)
   - [Authentication](#b-authentication)
   - [AI Computer Vision Gateway](#c-ai-computer-vision-gateway)
   - [Custom Consultations](#d-custom-consultations)
   - [Product Catalog](#e-product-catalog)
5. [Error Handling](#5-error-handling)
6. [Security Posture & Controls](#6-security-posture--controls)
7. [Testing Infrastructure](#7-testing-infrastructure)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Architecture & Request Lifecycle

```mermaid
flowchart TD
    Client["Client Application\n(Next.js 15 Frontend)"]

    subgraph Backend["Express.js 5 Backend (Port 5000)"]
        Parser["Body Parser & CORS\n(15MB Base64 limit, dynamic origin)"]
        Router["API Router\n(/api/v1/*)"]
        RateLimit["Rate Limiter\n(aiRateLimiter: 20 req/min)"]
        AuthGuards["Auth Middleware\n(verifyFirebaseToken / requireAdmin)"]
        Controllers["Controllers\n(Auth, Consultation, Product, AI)"]
        GlobalErr["Global Error Handler\n(Sanitized 500 & 404 Route Catch)"]
    end

    subgraph External["External Infrastructure"]
        Firebase["Firebase Auth Service\n(Admin SDK ID Token Verification)"]
        Supabase["PostgreSQL Database\n(Supabase Connection Pooler :6543)"]
        FastAPI["Python FastAPI Service\n(Computer Vision :8000)"]
    end

    Client -->|"HTTP JSON / Base64 Payload"| Parser
    Parser --> Router
    Router -->|"AI Endpoints"| RateLimit
    RateLimit --> Controllers
    Router -->|"Protected Routes"| AuthGuards
    AuthGuards -->|"Verify Bearer Token"| Firebase
    AuthGuards -->|"Check Admin/Owner Role"| Supabase
    AuthGuards --> Controllers
    Router -->|"Public Routes"| Controllers
    Controllers -->|"Prisma Client (CRUD)"| Supabase
    Controllers -->|"Multipart Form POST (/v1/analyze)"| FastAPI
    Controllers -.->|"Exceptions"| GlobalErr
    GlobalErr -->|"Sanitized JSON Error"| Client
```

### Request Lifecycle

1. **Payload Ingestion**: Requests pass through `cors()` and `express.json({ limit: '15mb' })`. The high body-parser ceiling accommodates compressed Base64 hand photographs transferred from the frontend.
2. **Rate Limiting**: AI vision endpoints (`/api/v1/ai/*`) pass through `aiRateLimiter`, enforcing a sliding window of 20 requests per minute per IP to prevent compute exhaustion.
3. **Authentication & RBAC**:
   - Customer routes pass through `verifyFirebaseToken`, validating Google ID tokens via the Firebase Admin SDK.
   - Administrative routes (`GET /api/v1/consultations` and `PATCH /api/v1/consultations/:id`) pass through `requireAdmin`, validating that the caller's verified `firebaseUid` has `role === 'admin'` or `role === 'owner'` in the PostgreSQL `users` table.
4. **Data Persistence**: Database operations execute via a singleton Prisma Client (`src/config/prisma.js`) over Supabase's transaction pooler (port 6543).
5. **AI Vision Communication**: The backend acts as a gateway; it accepts Base64 images, reconstructs binary buffers, and dispatches parallel `multipart/form-data` requests to the Python FastAPI microservice (`POST /v1/analyze`) with a 10-second timeout. If the AI service is unavailable, a graceful fallback response is returned.
6. **Centralized Error Handling**: Unhandled exceptions forwarded via `next(err)` are intercepted by the global error handler in `src/app.js`. In production, internal error details are sanitized to prevent sensitive information leakage.

---

## 2. Prerequisites & Environment Configuration

### Prerequisites

- **Node.js**: `v18.0.0` or later (`node -v`)
- **npm**: `v9.0.0` or later (`npm -v`)
- **Firebase Service Account**: `serviceAccountKey.json` placed in the `backend/` directory.

### Installation

```bash
cd backend
npm install
```

### Environment Variables (`.env`)

Create a `.env` file in `backend/` (copy from `.env.example`):

```bash
cp .env.example .env
```

| Variable         | Type   | Default / Example                                                                                          | Purpose                                                                                                   |
| ---------------- | ------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `PORT`           | Number | `5000`                                                                                                     | Port on which the Express HTTP server listens (`server.js`).                                              |
| `DATABASE_URL`   | String | `postgresql://postgres.[REF]:[PASS]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | PostgreSQL transaction pooler URI (port 6543, `pgbouncer=true`). Used by Prisma for runtime queries.      |
| `DIRECT_URL`     | String | `postgresql://postgres.[REF]:[PASS]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`                | PostgreSQL direct session URI (port 5432). Required by Prisma for DDL schema pushes (`prisma db push`).   |
| `AI_SERVICE_URL` | String | `http://localhost:8000`                                                                                    | Base URL of the Python FastAPI vision microservice.                                                       |
| `CORS_ORIGIN`    | String | `http://localhost:3000`                                                                                    | Optional comma-separated whitelist of allowed web origins. Defaults to wildcard in development.           |
| `NODE_ENV`       | String | `development`                                                                                              | Environment mode (`development` or `production`). Controls error message sanitization and Prisma logging. |

> **Crucial Setup Note**: On Windows, ensure `.env` is saved using **UTF-8** encoding without BOM. UTF-16 LE encoding causes Node.js and Prisma to read zero variables (`injected env (0)`), preventing database connectivity.

### Firebase Service Account Setup

Download your Firebase Admin private key from the Firebase Console (`Project Settings -> Service Accounts -> Generate New Private Key`) and place it at:

```
backend/serviceAccountKey.json
```

_(This file is strictly excluded by `.gitignore`)._

### Prisma Client Generation & Server Startup

```bash
# Generate typed Prisma Client
npx prisma generate

# Run development server with watch mode
npm run dev

# Run production server
npm start
```

---

## 3. Database Architecture & Models

The database layer runs on **PostgreSQL hosted via Supabase Cloud**, queried through **Prisma ORM v6**.

```mermaid
erDiagram
    users ||--o{ consultations : "places (1:N, onDelete: Cascade)"
    products ||--o{ consultations : "categorizes (0..1:N, onDelete: SetNull)"

    users {
        String id PK "UUID"
        String firebaseUid UK "Unique Firebase Auth UID"
        String email UK "Unique Email Address"
        String name "Nullable Full Name"
        String photoUrl "Nullable Profile Picture URL"
        String phone "Nullable Phone Number"
        Role role "customer | admin | owner (default: customer)"
        String savedSizePreset "Nullable Active Preset (XS/S/M/L/Custom)"
        Json savedMeasurements "Nullable JSON Finger Widths (mm)"
        DateTime createdAt "default: now()"
        DateTime updatedAt
    }

    products {
        String id PK "UUID"
        String name "Product Title"
        String tier "Tier Category"
        Int price "Unit Price in IDR"
        String priceRange "Nullable Price Range Description"
        String description "Nullable Long Description"
        String imageUrl "Nullable Product Image Path"
        Boolean isActive "Catalog Visibility (default: true)"
        DateTime createdAt "default: now()"
        DateTime updatedAt
    }

    consultations {
        String id PK "UUID"
        String consultationCode "Business Code (e.g. DNL-KNS-...)"
        String userId FK "References users.id (onDelete: Cascade)"
        String productId FK "References products.id (onDelete: SetNull)"
        String serviceType "default: Custom Press-On Nails"
        String designName "Nullable Custom Design Title"
        String variant "default: Custom"
        String referenceLink "Nullable Customer Inspiration URL"
        String photoUrl "Nullable Reference Photo (Base64/URL)"
        String customerNotes "Nullable Special Requests"
        String estimatedPrice "Price Quote (default: Menunggu estimasi)"
        String shopeeUrl "Nullable Official Shopee Checkout URL"
        Boolean isValidPhoto "Quality Gate Flag (default: false)"
        Boolean coinDetected "Reference Coin Flag (default: false)"
        String aiRejectionReason "Nullable Quality Gate Error Message"
        String aiSuggestedSize "Nullable AI Sized Preset (XS/S/M/L)"
        Json aiMeasurements "Nullable AI Finger Widths in mm"
        String confirmedSize "Nullable Admin Final Size"
        Json confirmedMeasurements "Nullable Admin Final Measurements"
        String adminFeedback "Nullable Notes from Admin Review"
        DateTime reviewedAt "Nullable Timestamp of Admin Approval"
        ConsultationStatus status "PENDING | NEED_REPHOTO | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED"
        DateTime createdAt "default: now()"
        DateTime updatedAt
    }

    sale_records {
        String id PK "UUID"
        String orderId UK "Sales Order ID"
        String customerId "Nullable Historical Customer ID"
        String channel "Sales Channel (Shopee/WhatsApp)"
        DateTime orderDate "Transaction Date"
        Int totalItems "Item Count"
        Int totalAmount "Total IDR Amount"
        Int pressOnCount "Press-on units"
        Boolean hasAccessory "default: false"
        String highestTier "Nullable Highest Tier"
        String categories "Nullable Category Tags"
        DateTime createdAt "default: now()"
    }
```

### Core vs Additional Models

- **Active Core Models**: `User`, `Product`, and `Consultation` actively drive the authentication, catalog, and ordering workflows.
- **Additional / Schema-Only Model**: `SaleRecord` (`sale_records`) is defined in `prisma/schema.prisma` to model historical offline sales data (828 transactions), but has **no active API routes or controllers** in the current Express backend.

> **Full Data Dictionary & Schema Documentation**: See [docs/DATABASE.md](docs/DATABASE.md) for field-by-field definitions, JSON column structures, referential integrity behaviors, and known schema design limitations.

---

## 4. API Reference

All resource endpoints are prefixed with `/api/v1`.

### A. System Diagnostics

#### `GET /`

- **Purpose**: Root index indicating service status and primary endpoints.
- **Auth**: None (Public).
- **Response (`200 OK`)**:
  ```json
  {
    "status": "online",
    "message": "Dinail.co Backend API Server",
    "endpoints": {
      "health": "/api/health",
      "products": "/api/v1/products",
      "authSync": "/api/v1/auth/sync",
      "consultations": "/api/v1/consultations",
      "aiAnalyze": "/api/v1/ai/analyze-nails"
    }
  }
  ```

#### `GET /api/health`

- **Purpose**: Health check endpoint for uptime monitoring and deployment verification.
- **Auth**: None (Public).
- **Response (`200 OK`)**:
  ```json
  {
    "status": "ok",
    "message": "Backend Dinail.co API is healthy and operational.",
    "timestamp": "2026-11-27T12:00:00.000Z"
  }
  ```

---

### B. Authentication

#### `POST /api/v1/auth/sync`

- **Purpose**: Synchronize user session after Firebase Google Sign-In. Upserts record into PostgreSQL `users` table.
- **Auth**: **Required** (`Authorization: Bearer <FIREBASE_ID_TOKEN>`).
- **Request Body**:
  | Field | Type | Required | Description |
  |---|---|---|---|
  | `name` | String | No | Display name override (falls back to token name or "Customer Dinail"). |
  | `email` | String | No | Fallback email if missing from token claims. |
  | `photoUrl` | String | No | Avatar URL override (falls back to token picture). |
  | `phone` | String | No | Contact phone number. |
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User berhasil disinkronkan.",
    "data": {
      "id": "1150da12-22f7-4ff4-bee1-161d37b6def2",
      "firebaseUid": "E786ArcXYXeQH6yTcu95x6kVrk93",
      "email": "customer@example.com",
      "name": "Jane Doe",
      "photoUrl": "https://lh3.googleusercontent.com/...",
      "phone": null,
      "role": "customer",
      "savedSizePreset": null,
      "savedMeasurements": null,
      "createdAt": "2026-11-27T08:37:04.914Z",
      "updatedAt": "2026-11-27T08:37:04.914Z"
    }
  }
  ```
- **Errors**: `400 Bad Request` (email missing), `401 Unauthorized` (invalid/expired token), `503 Service Unavailable` (Firebase Admin uninitialized).

#### `GET /api/v1/auth/me`

- **Purpose**: Retrieve authenticated user profile by verified `firebaseUid`.
- **Auth**: **Required** (`Authorization: Bearer <FIREBASE_ID_TOKEN>`).
- **Success Response (`200 OK`)**: `{ "success": true, "data": User }`
- **Errors**: `401 Unauthorized`, `404 Not Found` (user not yet synced).

---

### C. AI Computer Vision Gateway

#### `POST /api/v1/ai/analyze-nails`

- **Purpose**: Proxy two hand photographs to the Python FastAPI vision microservice (`POST /v1/analyze`), evaluate quality gates, calculate coin scale, and map fingernail widths to standard size presets.
- **Auth**: None (Public).
- **Rate Limit**: **Enforced** (Max 20 requests per minute per IP via `aiRateLimiter`).
- **Request Body**:
  | Field | Type | Required | Constraints |
  |---|---|---|---|
  | `fourFingers` | String | Yes | Base64 or DataURL string of index-to-pinky fingers with coin (JPEG/PNG/WebP, <= 12 MB). |
  | `thumb` | String | Yes | Base64 or DataURL string of thumb with coin (JPEG/PNG/WebP, <= 12 MB). |
  | `coin` | String | No | Denomination: `"50"`, `"100"`, `"200"`, `"500"`, `"1000"`. Default: `"500"`. |
- **Success Response (`200 OK`) — Live Vision Microservice**:
  ```json
  {
    "success": true,
    "source": "ai_service",
    "recommendedPreset": "M",
    "measurements": {
      "thumb": 16,
      "index": 12,
      "middle": 13,
      "ring": 12,
      "pinky": 9
    },
    "confidenceScore": 95,
    "scaleThumb": 10.73,
    "scaleFingers": 8.49,
    "coinType": "500",
    "needsAdminCheck": true
  }
  ```
- **Success Response (`200 OK`) — Quality Gate Rejection (Blurry / Missing Coin)**:
  ```json
  {
    "success": false,
    "errorMessage": "[Foto Ibu Jari] Foto buram (ketajaman 51, minimal 150). Pegang kamera lebih stabil.",
    "details": {
      "thumb": {
        "ok": false,
        "quality": { "pass": false, "reasons": ["..."] }
      },
      "fourFingers": { "ok": true }
    }
  }
  ```
- **Fallback Response (`200 OK`)**:
  When `AI_SERVICE_URL` is offline or times out (10s), the gateway returns `source: "mock_fallback"` with synthetic measurements (Preset M, 95% confidence) to preserve UI stability during development.
- **Errors**: `400 Bad Request` (missing/invalid image, unsupported MIME type, size > 12 MB), `429 Too Many Requests` (rate limit exceeded).

#### `POST /api/v1/ai/analyze-photo`

- **Purpose**: Analyze single photograph with coin reference.
- **Auth**: None (Public, Rate-limited: 20 req/min).
- **Request Body**: `{ "image": "data:image/jpeg;base64,...", "coin": "500", "nailWidthPx": 120 }`

---

### D. Custom Consultations

#### `GET /api/v1/consultations`

- **Purpose**: List all customer custom nail consultation orders.
- **Auth**: **Required** (`Authorization: Bearer <FIREBASE_ID_TOKEN>`).
- **Authorization**: **Admin/Owner Only** (Verified server-side via `requireAdmin`).
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  |---|---|---|---|
  | `status` | String | No | Enum filter: `PENDING`, `CONFIRMED`, `NEED_REPHOTO`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`. Case-insensitive; `"semua"` returns all. |
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "total": 1,
    "data": [
      {
        "id": "e4414f52-...",
        "consultationCode": "DNL-KNS-20261127-14",
        "userId": "1150da12-...",
        "productId": null,
        "serviceType": "Custom Press-On Nails",
        "designName": "Autumn Velvet French",
        "variant": "Custom",
        "referenceLink": "https://instagram.com/p/...",
        "photoUrl": "data:image/jpeg;base64,...",
        "customerNotes": "Req warna nude glossy",
        "estimatedPrice": "Rp 85.000",
        "shopeeUrl": "https://shopee.co.id/...",
        "isValidPhoto": true,
        "coinDetected": true,
        "aiRejectionReason": null,
        "aiSuggestedSize": "M",
        "aiMeasurements": {
          "thumb": 16,
          "index": 12,
          "middle": 13,
          "ring": 12,
          "pinky": 9
        },
        "confirmedSize": "Size M (16-12-13-12-9 mm)",
        "confirmedMeasurements": null,
        "adminFeedback": "Desain siap diproses.",
        "reviewedAt": "2026-11-27T10:00:00.000Z",
        "status": "CONFIRMED",
        "createdAt": "2026-11-27T08:00:00.000Z",
        "updatedAt": "2026-11-27T10:00:00.000Z",
        "user": { "id": "...", "name": "Jane Doe", "email": "..." },
        "product": null
      }
    ]
  }
  ```
- **Errors**: `401 Unauthorized` (missing/invalid token), `403 Forbidden` (caller is regular `customer`).

#### `GET /api/v1/consultations/me`

- **Purpose**: List consultations belonging to the authenticated caller.
- **Auth**: **Required** (`Authorization: Bearer <FIREBASE_ID_TOKEN>`).
- **Success Response (`200 OK`)**: `{ "success": true, "data": [ ...Consultation ] }`
- **Errors**: `401 Unauthorized` (token missing or invalid).

#### `POST /api/v1/consultations`

- **Purpose**: Submit custom nail consultation request with design references and nail measurements.
- **Auth**: **Optional** (`optionalFirebaseToken`).
  - **Authenticated Users**: Strictly and automatically bound to the caller's verified `req.user.uid`.
  - **Unauthenticated Users**: Strictly isolated to the designated `guest-user` account (`guest@dinail.co`). Arbitrary client-side email/UID spoofing is strictly prevented.
- **Request Body**:
  | Field | Type | Required | Description |
  |---|---|---|---|
  | `consultationCode` | String | No | Custom tracking code. Auto-generated (`DNL-KNS-YYYYMMDD-XX`) if omitted. |
  | `designName` | String | No | Custom design title (default: `"Custom Press-On Nails"`). |
  | `serviceType` | String | No | Service category (default: `"Custom Press-On Nails"`). |
  | `variant` | String | No | Variant name (default: `"Custom"`). |
  | `referenceLink` | String | No | External reference link (Pinterest/Instagram). |
  | `photoUrl` | String | No | Base64 or URL of customer reference photo. |
  | `customerNotes` | String | No | Special requests or sizing notes. |
  | `estimatedPrice` | String | No | Initial price note (default: `"Menunggu estimasi"`). |
  | `productId` | String | No | UUID of catalog product if linked. |
  | `isValidPhoto` | Boolean | No | Quality gate pass/fail flag. |
  | `coinDetected` | Boolean | No | Coin detection flag. |
  | `aiSuggestedSize`| String | No | Preset recommended by AI (e.g. `"M"`). |
  | `aiMeasurements` | Object | No | Finger width measurements in mm (`{ thumb: 16, ... }`). |
- **Success Response (`201 Created`)**: `{ "success": true, "message": "Pengajuan konsultasi berhasil dibuat.", "data": Consultation }`

#### `PATCH /api/v1/consultations/:id`

- **Purpose**: Administrative review: update status, confirm nail sizes, provide price quotes, and attach official Shopee checkout link.
- **Path Parameter**: `:id` (Accepts UUID `id` or business code `consultationCode`).
- **Auth**: **Required** (`Authorization: Bearer <FIREBASE_ID_TOKEN>`).
- **Authorization**: **Admin/Owner Only** (Verified server-side via `requireAdmin`).
- **Request Body**:
  | Field | Type | Required | Description |
  |---|---|---|---|
  | `status` | String | No | Target status. Supports Indonesian strings (`"disetujui"`, `"siap_checkout"`, `"proses"`, `"antrian"`, `"dibatalkan"`) and normalizes to `ConsultationStatus` enum. |
  | `adminFeedback` | String | No | Review feedback or instructions for the customer. |
  | `estimatedPrice` | String | No | Final production price quote (e.g. `"Rp 85.000"`). |
  | `shopeeUrl` | String | No | Official Shopee checkout link. Validated to start with `https://`. |
  | `confirmedSize` | String | No | Final confirmed nail size preset or summary string. |
  | `confirmedMeasurements` | Object | No | Final confirmed finger measurements JSON. |
- **Success Response (`200 OK`)**: `{ "success": true, "message": "Status konsultasi berhasil diperbarui.", "data": Consultation }`
- **Errors**: `400 Bad Request` (invalid status enum or malformed Shopee URL), `401 Unauthorized`, `403 Forbidden`, `404 Not Found` (consultation ID does not exist).

---

### E. Product Catalog

#### `GET /api/v1/products`

- **Purpose**: Retrieve active products ordered by price ascending.
- **Auth**: None (Public).
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "name": "Classic Glossy Nude",
        "tier": "Basic Tier",
        "price": 65000,
        "priceRange": "Rp 65.000 - Rp 80.000",
        "description": "Natural everyday nude gloss finish.",
        "imageUrl": "/assets/catalog/sample-1.jpg",
        "isActive": true,
        "createdAt": "2026-11-20T10:00:00.000Z",
        "updatedAt": "2026-11-20T10:00:00.000Z"
      }
    ]
  }
  ```

#### `GET /api/v1/products/:id`

- **Purpose**: Retrieve single product details by UUID.
- **Auth**: None (Public).
- **Success Response (`200 OK`)**: `{ "success": true, "data": Product }`
- **Errors**: `404 Not Found`.

---

## 5. Error Handling

### Response Standard

All error responses return a consistent JSON payload:

```json
{
  "success": false,
  "message": "Human-readable explanation of error."
}
```

### HTTP Status Code Reference

| Status Code             | Meaning                | Trigger Condition                                                                                                                                                               |
| ----------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `200 OK`                | Succeeded              | Normal query/update operations.                                                                                                                                                 |
| `201 Created`           | Resource Created       | Successful consultation submission.                                                                                                                                             |
| `400 Bad Request`       | Client Input Error     | Missing required fields, unsupported image MIME types, invalid status enums, non-HTTPS Shopee URLs.                                                                             |
| `401 Unauthorized`      | Authentication Missing | Missing, malformed, or expired Firebase Bearer token.                                                                                                                           |
| `403 Forbidden`         | Authorization Refused  | Caller authenticated, but possesses `customer` role when attempting admin operations (`requireAdmin`).                                                                          |
| `404 Not Found`         | Resource Missing       | Non-existent product ID, consultation ID, user profile, or unmapped route.                                                                                                      |
| `429 Too Many Requests` | Rate Limit Exceeded    | Client exceeded 20 requests/minute on AI vision endpoints (`aiRateLimiter`).                                                                                                    |
| `500 Internal Error`    | Server Exception       | Uncaught runtime error. In production (`NODE_ENV=production`), error messages are sanitized to `"Terjadi kesalahan internal pada server."` to prevent database schema exposure. |
| `503 Unavailable`       | Dependency Missing     | Firebase Admin SDK credentials (`serviceAccountKey.json`) not found on server startup.                                                                                          |

---

## 6. Security Posture & Controls

### Implemented Protections

- **Server-Side RBAC**: Administrative endpoints (`GET /consultations` and `PATCH /consultations/:id`) strictly enforce `requireAdmin`, querying PostgreSQL to verify caller possesses `role === 'admin'` or `role === 'owner'`.
- **Token Identity Binding**: Authenticated consultation submissions (`POST /consultations`) strictly bind records to `req.user.uid`. Client-supplied user IDs and emails in the payload are ignored, preventing IDOR and account hijacking.
- **Guest Isolation**: Unauthenticated consultation submissions are strictly bound to a designated `guest-user` account, preventing guests from linking consultations to registered accounts without credentials.
- **AI Rate Limiting**: In-memory sliding-window rate limiter throttles compute-heavy AI requests to 20 req/min per IP, returning standard `X-RateLimit-*` headers and `429 Too Many Requests`.
- **Payload Validation**: AI endpoints strictly enforce an image MIME allowlist (`image/jpeg`, `image/png`, `image/webp`) and a 12 MB buffer ceiling.
- **Input Sanitization**: `PATCH /consultations/:id` validates status against Prisma enums and enforces that `shopeeUrl` must begin with `https://` to prevent open redirects and XSS schemes.
- **Production Error Sanitization**: Internal 500 error messages are masked in production mode to avoid leaking connection strings, table names, or Prisma exceptions.
- **Secret Protection**: `.env`, `node_modules`, and `serviceAccountKey.json` are excluded from version control via `.gitignore`.

### Known Limitations

- **In-Memory Rate Limiting**: The rate limiter uses an in-memory `Map`. In multi-instance or serverless environments, state is not shared across processes.
- **Base64 Database Storage**: Photos are transmitted and stored as Base64 text strings directly in PostgreSQL columns. While protected by a 15 MB parser limit, this increases database storage requirements compared to object storage.
- **Unused Dependency**: `joi` is present in `package.json` (`^18.3.2`) but not utilized; input validation is handled imperatively in controllers.

### Recommendations for Future Production Milestones

1. **Supabase Storage Bucket Integration**: Migrate photo uploads from Base64 database strings to a private or signed Supabase Storage bucket (`nail-photos`), storing only public URLs in the database.
2. **Distributed Rate Limiting**: Back rate limiting with Redis (e.g., via `ioredis` and `express-rate-limit`) when scaling across multiple container replicas.
3. **Formal Schema Validation**: Adopt a centralized schema validator (such as Zod or Joi) across all route handlers to replace imperative conditional checks.

---

## 7. Testing Infrastructure

- **Automated Test Framework**: Currently, **no automated test suite** (Jest, Mocha, Vitest, or Supertest) is integrated into `package.json` (the `npm test` script is not defined).
- **Integration Verification**: During the security audit, automated integration test scripts were executed against an ephemeral test server (`port 5091` and `5092`) verifying:
  - `GET /consultations` returns `401 Unauthorized` without token.
  - `PATCH /consultations/:id` returns `401 Unauthorized` without token.
  - `GET /consultations/me` returns `401 Unauthorized` gracefully without crashing.
  - `POST /ai/analyze-photo` returns `400 Bad Request` for invalid MIME types.
  - `aiRateLimiter` properly sets `X-RateLimit` headers and throttles abusive bursts.
  - `POST /consultations` guest submissions are strictly isolated to `guest-user` without hijacking registered accounts.
- **Manual Testing**: Ongoing verification is conducted using Postman, curl, and frontend integration testing against `localhost:5000`.

---

## 8. Troubleshooting

### Windows File Lock (`query_engine-windows.dll.node`)

- **Symptom**: `EPERM: operation not permitted` when running `npx prisma generate`.
- **Cause**: Background Node.js processes holding an active file lock on the Prisma DLL engine.
- **Resolution**: Terminate running node processes in PowerShell:
  ```powershell
  Stop-Process -Name node -Force
  npx prisma generate
  ```

### Zero Environment Variables Loaded (`injected env (0)`)

- **Symptom**: Prisma reports `injected env (0) from .env` and fails with `DATABASE_URL not found`.
- **Cause**: `.env` file was saved in UTF-16 LE encoding (default in Windows Notepad) or named `.env.txt`.
- **Resolution**: Open `.env` in VS Code, verify the bottom status bar displays **UTF-8**, and re-save.

### AI Service Fallback (`source: "mock_fallback"`)

- **Symptom**: AI endpoint returns simulated measurements instead of computer vision inference.
- **Cause**: Python FastAPI microservice is offline or `AI_SERVICE_URL` in `.env` is unreachable.
- **Resolution**: Start the Python microservice (`uvicorn dinail_ai.app:app --port 8000`) or verify `AI_SERVICE_URL` configuration.

---

## License

Developed by **Team A26-CS222**. Proprietary to **Dinail.co**.
