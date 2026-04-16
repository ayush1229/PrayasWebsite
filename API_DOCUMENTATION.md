# Prayas Website API Documentation

This document outlines all available API endpoints, their expected request payloads, response formats, and authentication requirements. 

> **Important**: The base URL for all endpoints below is `/api` unless specified otherwise (e.g., `/auth/...`). All endpoints expecting a JSON body must include the `Content-Type: application/json` header.

## Authentication & Authorization

The system uses HTTP-only cookies to handle JWT tokens. 

### Roles
- `super_admin`: Has full access, including creating and deleting other admins.
- `admin`: Has access to manage resources (pages, people, donations, etc.) but cannot create/delete other admins.

### Endpoints

#### `POST /auth/login`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response** (`200 OK`):
  Sets an `HttpOnly` cookie containing the JWT (`token=...`).
  ```json
  {
    "message": "Logged in successfully",
    "user": {
      "id": "ObjectId",
      "email": "user@example.com",
      "role": "admin"
    }
  }
  ```

#### `POST /auth/logout`
- **Auth Required**: Yes
- **Response** (`200 OK`): Clears the auth cookie.

#### `POST /auth/create-admin`
- **Auth Required**: Yes (`super_admin` only)
- **Request Body**:
  ```json
  {
    "email": "newadmin@example.com",
    "password": "strongpassword"
  }
  ```
- **Response** (`201 Created`): Returns the newly created admin object.

#### `DELETE /auth/admin/:id`
- **Auth Required**: Yes (`super_admin` only)
- **Response** (`200 OK`):
  ```json
  { "message": "Admin deleted successfully" }
  ```

---

## 1. Global (Site Configuration)

Manages site-wide configuration like contact info, social links, and donation details.

#### `GET /api/global`
- **Auth Required**: No
- **Response** (`200 OK`): Returns the site config object. If no record exists yet, a default object is returned with the Razorpay provider and the public key from `RAZORPAY_KEY_ID` when available.
  ```json
  {
    "type": "site_config",
    "donation": {
      "provider": "razorpay",
      "upi": { "upiId": "prayas@upi" }
    },
    "donationMessage": "Support us!",
    "contactEmail": "prayas@example.com",
    "socialLinks": {
      "instagram": "https://instagram.com/prayas"
    }
  }
  ```

#### `PUT /api/global`
- **Auth Required**: Yes (`admin` or `super_admin`)
- **Request Body**: Partial update object (e.g., `{"contactEmail": "new@example.com"}`).
- **Response** (`200 OK`): Returns the updated config object.

---

## 2. Achievements

#### `GET /api/achievements`
- **Auth Required**: No
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "ObjectId",
        "title": "First Academic Award",
        "slug": "first-academic-award",
        "category": "Academic",
        "year": 2024,
        "description": "...",
        "priority": 5,
        "isActive": true
      }
    ]
  }
  ```

#### `GET /api/achievements/:slug`
- **Auth Required**: No
- **Response** (`200 OK`): Returns a single achievement object by its URL slug.

#### `POST /api/achievements`
- **Auth Required**: Yes 
- **Request Body**:
  ```json
  {
    "title": "Award Title",             // Required
    "category": "Academic",             // Required (enum: Academic, Medical Aid, Recognition, Skills & Training)
    "year": 2024,                       // Required
    "description": "Optional desc",
    "images": ["url1", "url2"],
    "priority": 0,                      // Default: 0
    "isActive": true
  }
  ```
- **Response** (`201 Created`): Returns the created object. `slug` is auto-generated from the title.

#### `PUT /api/achievements/:id`
- **Auth Required**: Yes 
- **Request Body**: Partial achievement object.
- **Response** (`200 OK`): Returns the updated object.

#### `DELETE /api/achievements/:id`
- **Auth Required**: Yes 
- **Response** (`200 OK`):
  ```json
  { "success": true, "message": "Achievement deleted" }
  ```

---

## 3. Activities

#### `GET /api/activities`
- **Auth Required**: No
- **Response** (`200 OK`): Array of activity objects.

#### `GET /api/activities/:id`
- **Auth Required**: No
- **Response** (`200 OK`): Single activity object.

#### `POST /api/activities`
- **Auth Required**: Yes 
- **Request Body**:
  ```json
  {
    "activityName": "GyanManthan",     // Required (enum: GyanManthan, Spardha, Prayas, Extra)
    "year": 2024,                      // Required
    "images": [{ "imageUrl": "...", "altText": "..." }],
    "tags": ["education", "rural"],
    "isActive": true
  }
  ```
- **Response** (`201 Created`): Created object. Auto-assigns `createdBy` to the logged in admin.

#### `PUT /api/activities/:id`
- **Auth Required**: Yes 
- **Request Body**: Partial update object.
- **Response** (`200 OK`): Updated object.

#### `DELETE /api/activities/:id`
- **Auth Required**: Yes 
- **Response** (`200 OK`)

---

## 4. Contacts (Inquiries)

*Note: All contact endpoints currently require authentication.*

#### `GET /api/contacts`
- **Auth Required**: Yes
- **Response** (`200 OK`): Array of non-archived contact inquiries.

#### `GET /api/contacts/:id`
- **Auth Required**: Yes
- **Response** (`200 OK`): Single inquiry object.

#### `POST /api/contacts`
- **Auth Required**: Yes 
- **Request Body**:
  ```json
  {
    "fullName": "John Doe",            // Required
    "email": "john@example.com",       // Required
    "phoneNumber": "1234567890",
    "helpType": "Donation Query",
    "message": "I would like to help." // Required
  }
  ```
- **Response** (`201 Created`)

#### `PUT /api/contacts/:id`
- **Auth Required**: Yes 
- **Request Body**: Partial update object (can update `status`: "Unread"|"Replied"|"Closed", `replyMessage`, `isArchived`, etc).
- **Response** (`200 OK`)

#### `DELETE /api/contacts/:id`
- **Auth Required**: Yes 
- **Response** (`200 OK`)

---

## 5. Donations

#### `GET /api/donations/config`
- **Auth Required**: No
- **Response** (`200 OK`): Returns the public Razorpay checkout config used by the frontend.
  ```json
  {
    "success": true,
    "data": {
      "enabled": true,
      "provider": "razorpay",
      "key": "rzp_test_...",
      "currency": "INR",
      "name": "Prayas",
      "description": "Support Prayas through your donation."
    },
    "donationMessage": "Support us!"
  }
  ```

#### `POST /api/donations/create-order`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "donorName": "Jane Doe",
    "email": "jane@example.com",
    "contact": "9876543210",
    "amount": 500,
    "message": "Keep up the good work"
  }
  ```
- **Response** (`201 Created`): Creates a Razorpay order and a pending donation record in MongoDB.

#### `POST /api/donations/verify`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "razorpay_order_id": "order_...",
    "razorpay_payment_id": "pay_...",
    "razorpay_signature": "signature_from_checkout"
  }
  ```
- **Response** (`200 OK`): Verifies the signature server-side and marks the donation as successful.

#### `POST /api/donations/failure`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "orderId": "order_...",
    "failureReason": "Payment declined"
  }
  ```
- **Response** (`200 OK`): Marks a pending donation as failed.

#### `GET /api/donations`
- **Auth Required**: No
- **Response** (`200 OK`): Array of donations.

#### `GET /api/donations/:id`
- **Auth Required**: No
- **Response** (`200 OK`): Single donation object.

#### `POST /api/donations`
- **Auth Required**: Yes 
- **Request Body**:
  ```json
  {
    "donorName": "Jane Doe",
    "email": "jane@example.com",
    "amount": 5000,                    // Required
    "currency": "INR",                 // Default: INR
    "transactionId": "txn_...",        // Optional, Unique
    "orderId": "order_...",            // Optional, Unique
    "paymentId": "pay_...",            // Optional, Unique
    "gateway": "razorpay"
  }
  ```
- **Response** (`201 Created`)

#### `PUT /api/donations/:id`
- **Auth Required**: Yes 
- **Request Body**: Partial update object (updates `paymentStatus`: "Pending"|"Success"|"Failed"|"Refunded", or `verified`: boolean).
- **Response** (`200 OK`)

#### `DELETE /api/donations/:id`
- **Auth Required**: Yes 
- **Response** (`200 OK`)

---

## 6. Newsletter

#### `GET /api/newsletter`
- **Auth Required**: No
- **Response** (`200 OK`): Array of active subscribers.

#### `POST /api/newsletter/subscribe`
- **Auth Required**: No
- **Request Body**:
  ```json
  { "email": "user@example.com" }
  ```
- **Response** (`201 Created`): Subscribes or reactivates an email address.

#### `POST /api/newsletter/unsubscribe`
- **Auth Required**: No
- **Request Body**:
  ```json
  { "email": "user@example.com" }
  ```
- **Response** (`200 OK`): Flags the record as `isActive: false`.

---

## 7. Pages (Dynamic CMS Content)

#### `GET /api/pages`
- **Auth Required**: No
- **Response** (`200 OK`): Array of published pages.

#### `GET /api/pages/:slug`
- **Auth Required**: No
- **Response** (`200 OK`): Single page object based on its slug.

#### `POST /api/pages`
- **Auth Required**: Yes 
- **Request Body**:
  ```json
  {
    "slug": "about-us",                // Required, Unique
    "title": "About Us",               // Required
    "content": "<h1>Hello</h1>",
    "metaTitle": "SEO Title",
    "metaDescription": "SEO Desc",
    "isPublished": true
  }
  ```
- **Response** (`201 Created`)

#### `PUT /api/pages/:slug`
- **Auth Required**: Yes 
- **Request Body**: Partial update object.
- **Response** (`200 OK`)

#### `DELETE /api/pages/:slug`
- **Auth Required**: Yes 
- **Response** (`200 OK`)

---

## 8. People (Faculty/Student Directory)

#### `GET /api/people`
- **Auth Required**: No
- **Response** (`200 OK`): Array of active people, automatically sorted with Faculty before Students.

#### `GET /api/people/:id`
- **Auth Required**: No
- **Response** (`200 OK`): Single person object.

#### `POST /api/people`
- **Auth Required**: Yes 
- **Request Body**:
  ```json
  {
    "roleType": "Faculty",             // Required (enum: Faculty, Student)
    "name": "Dr. Smith",               // Required
    "email": "smith@school.edu",
    "phone": "9876543210",
    "designation": "Professor",
    "bio": "...",
    "profileImageUrl": "...",
    "socialLinks": { "twitter": "...", "linkedin": "..." },
    "displayOrder": 1,                 // Default: 0
    "isActive": true
  }
  ```
- **Response** (`201 Created`)

#### `PUT /api/people/:id`
- **Auth Required**: Yes 
- **Request Body**: Partial update object.
- **Response** (`200 OK`)

#### `DELETE /api/people/:id`
- **Auth Required**: Yes 
- **Response** (`200 OK`)
