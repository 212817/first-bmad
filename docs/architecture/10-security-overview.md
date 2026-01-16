# 10. Security Overview

### 10.1 Security Layers

| Layer              | Measures                                     |
| ------------------ | -------------------------------------------- |
| **Transport**      | HTTPS only, HSTS                             |
| **Authentication** | OAuth 2.0, JWT (15min access, 7d refresh)    |
| **Authorization**  | User owns only their data                    |
| **API**            | Rate limiting, input validation (Zod)        |
| **Storage**        | Signed URLs (15min expiry)                   |
| **Headers**        | CSP, X-Frame-Options, X-Content-Type-Options |

### 10.2 Content Security Policy

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' https://*.r2.cloudflarestorage.com data:;
connect-src 'self' https://api.wheredidipark.app;
```

---
