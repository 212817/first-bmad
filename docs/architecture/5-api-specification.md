# 5. API Specification

### 5.1 Base Configuration

```yaml
openapi: 3.1.0
info:
  title: Where Did I Park API
  version: 1.0.0
servers:
  - url: https://api.wheredidipark.app/v1
    description: Production
  - url: http://localhost:3001/v1
    description: Development
```

### 5.2 Authentication Endpoints

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| GET    | `/auth/google`          | Initiate Google OAuth    |
| GET    | `/auth/google/callback` | Google OAuth callback    |
| GET    | `/auth/apple`           | Initiate Apple Sign-In   |
| POST   | `/auth/apple/callback`  | Apple Sign-In callback   |
| POST   | `/auth/refresh`         | Refresh access token     |
| POST   | `/auth/logout`          | Invalidate refresh token |
| GET    | `/auth/me`              | Get current user         |

### 5.3 Parking Spot Endpoints

| Method | Endpoint           | Description                   |
| ------ | ------------------ | ----------------------------- |
| POST   | `/spots`           | Save new parking spot         |
| GET    | `/spots`           | List user's spots (paginated) |
| GET    | `/spots/active`    | Get active spot               |
| GET    | `/spots/:id`       | Get spot by ID                |
| PATCH  | `/spots/:id`       | Update spot                   |
| DELETE | `/spots/:id`       | Delete spot                   |
| POST   | `/spots/:id/clear` | Mark spot as cleared          |

### 5.4 Photo Endpoints

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| POST   | `/photos/upload-url` | Get signed upload URL |
| DELETE | `/photos/:key`       | Delete photo from R2  |

### 5.5 Geocoding Endpoints

| Method | Endpoint           | Description                         |
| ------ | ------------------ | ----------------------------------- |
| GET    | `/geocode/reverse` | Reverse geocode (lat/lng → address) |

### 5.6 Standard Response Formats

**Success Response:**

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}
```

**Error Response:**

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
```

### 5.7 Error Codes

| Code                   | HTTP Status | Description           |
| ---------------------- | ----------- | --------------------- |
| `VALIDATION_ERROR`     | 400         | Invalid request data  |
| `AUTHENTICATION_ERROR` | 401         | Missing/invalid token |
| `AUTHORIZATION_ERROR`  | 403         | Not allowed           |
| `NOT_FOUND`            | 404         | Resource not found    |
| `CONFLICT`             | 409         | Resource conflict     |
| `RATE_LIMIT_EXCEEDED`  | 429         | Too many requests     |
| `INTERNAL_ERROR`       | 500         | Server error          |

---
