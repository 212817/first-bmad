# 9. External Services

### 9.1 JWT Service

```typescript
// services/jwt/jwt.service.ts
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import type { AccessTokenPayload, RefreshTokenPayload } from './types';

export const jwtService = {
  generateAccessToken: (userId: string, email: string): string => {
    const payload: AccessTokenPayload = {
      sub: userId,
      email,
      type: 'access',
    };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  },

  generateRefreshToken: (userId: string): string => {
    const payload: RefreshTokenPayload = {
      sub: userId,
      type: 'refresh',
    };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  },

  verifyAccessToken: (token: string): AccessTokenPayload => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  },

  verifyRefreshToken: (token: string): RefreshTokenPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  },
};
```

### 9.2 R2 Storage Service

```typescript
// services/r2/r2.service.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/config/env';
import { nanoid } from 'nanoid';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export const r2Service = {
  generateUploadUrl: async (userId: string): Promise<{ uploadUrl: string; key: string }> => {
    const key = `${userId}/${nanoid()}.jpg`;

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: 'image/jpeg',
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 }); // 15 min

    return { uploadUrl, key };
  },

  generateViewUrl: async (key: string): Promise<string> => {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    return getSignedUrl(r2Client, command, { expiresIn: 900 }); // 15 min
  },

  deletePhoto: async (key: string): Promise<void> => {
    const command = new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
  },
};
```

### 9.3 Geocoding Service

```typescript
// services/geocoding/geocoding.service.ts
import { geocacheRepository } from '@/repositories/geocache.repository';
import { env } from '@/config/env';

const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const PRECISION = 4; // ~11m accuracy for cache lookup

export const geocodingService = {
  reverseGeocode: async (lat: number, lng: number): Promise<string | null> => {
    // Round coords for cache lookup
    const roundedLat = Number(lat.toFixed(PRECISION));
    const roundedLng = Number(lng.toFixed(PRECISION));

    // Check cache first
    const cached = await geocacheRepository.findByCoords(roundedLat, roundedLng);
    if (cached && new Date(cached.expiresAt) > new Date()) {
      return cached.address;
    }

    // Fetch from OpenCage API
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${env.OPENCAGE_API_KEY}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const address = data.results?.[0]?.formatted || null;

    // Cache the result
    if (address) {
      await geocacheRepository.upsert({
        lat: roundedLat,
        lng: roundedLng,
        address,
        expiresAt: new Date(Date.now() + CACHE_DURATION_MS),
      });
    }

    return address;
  },
};
```

---
