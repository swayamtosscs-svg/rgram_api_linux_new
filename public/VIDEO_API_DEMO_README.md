# Video API Demo

## Admin API Documentation

This document provides information about the admin API endpoints available in the system. These endpoints are secured and require admin authentication.

### Authentication

All admin API endpoints require authentication using a Bearer token in the Authorization header:

```
Authorization: Bearer <your_admin_token>
```

Only users with admin privileges can access these endpoints.

### Admin API Endpoints

#### 1. List/Search Users

```
GET /api/admin/users
```

**Query Parameters:**
- `q` (optional): Search term for filtering users by email, username, or full name

**Response:**
```json
{
  "success": true,
  "message": "Users list",
  "data": {
    "users": [/* array of user objects */]
  }
}
```

#### 2. Verify User

```
PUT /api/admin/verify-user/{id}
```

**Request Body:**
```json
{
  "approve": true|false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User verification updated",
  "data": {
    "isVerified": true|false
  }
}
```

#### 3. Verify Page

```
PUT /api/admin/verify-page/{id}
```

**Request Body:**
```json
{
  "approve": true|false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Page verification updated",
  "data": {
    "isVerified": true|false
  }
}
```

#### 4. Approve/Reject Donation

```
PUT /api/admin/donation/{id}/approve
```

**Request Body:**
```json
{
  "approve": true|false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation request updated",
  "data": {
    "status": "active"|"rejected"
  }
}
```

#### 5. Get Flagged Content Reports

```
GET /api/admin/reports
```

**Response:**
```json
{
  "success": true,
  "message": "Reports list",
  "data": {
    "flaggedPosts": [/* array of flagged post objects */],
    "flaggedComments": [/* array of flagged comment objects */]
  }
}
```

#### 6. Remove Flagged Post

```
DELETE /api/admin/post/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Post removed"
}
```

#### 7. Remove Flagged Comment

```
DELETE /api/admin/comment/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment removed"
}
```

### Error Responses

All endpoints may return the following error responses:

- **401 Unauthorized**
  ```json
  {
    "success": false,
    "message": "Authentication required"
  }
  ```

- **403 Forbidden**
  ```json
  {
    "success": false,
    "message": "Admin access required"
  }
  ```

- **404 Not Found**
  ```json
  {
    "success": false,
    "message": "Resource not found"
  }
  ```

- **405 Method Not Allowed**
  ```json
  {
    "success": false,
    "message": "Method not allowed"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```