# OAuth Implementation Guide for Post Dominator

## Table of Contents
1. [Overview](#overview)
2. [Core Technology: OAuth 2.0](#core-technology-oauth-20)
3. [Architecture Overview](#architecture-overview)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Platform-Specific Guides](#platform-specific-guides)
6. [Security Best Practices](#security-best-practices)
7. [Token Management](#token-management)
8. [Testing & Troubleshooting](#testing--troubleshooting)

---

## Overview

This guide provides a complete implementation plan for connecting social media accounts to Post Dominator using OAuth 2.0. The Connections feature allows users to link their social media accounts so the app can post on their behalf and pull analytics.

### What You'll Build

- **Frontend**: Connection UI with platform cards and status indicators
- **Backend**: OAuth 2.0 flow handlers for each platform
- **Database**: Secure token storage and management
- **API Routes**: Authentication endpoints and callback handlers

---

## Core Technology: OAuth 2.0

### What is OAuth 2.0?

OAuth 2.0 is an authorization framework that allows third-party applications to obtain limited access to user accounts. Instead of sharing passwords, users grant permissions through access tokens.

### Key Concepts

1. **Authorization Server**: The social platform's server (Facebook, Twitter, etc.)
2. **Resource Server**: The platform's API that provides user data
3. **Client**: Your Post Dominator application
4. **Resource Owner**: The user connecting their account
5. **Access Token**: A credential that allows access to the user's resources
6. **Refresh Token**: Used to obtain new access tokens when they expire

### OAuth 2.0 Flow

```
1. User clicks "Connect Facebook" → Redirect to Facebook login
2. User authorizes your app → Facebook redirects back with authorization code
3. Your server exchanges code for access token → Store token securely
4. Use access token to make API calls → Post content, fetch analytics
```

---

## Architecture Overview

### Recommended Tech Stack

- **Backend Framework**: Next.js API Routes (or Express.js if separate backend)
- **Database**: PostgreSQL/MySQL for token storage
- **ORM**: Prisma or Drizzle ORM
- **HTTP Client**: Axios or Fetch API
- **Token Encryption**: Use environment variables + encryption at rest

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [platform]/
│   │   │   │   ├── route.ts          # Initiate OAuth flow
│   │   │   │   └── callback/
│   │   │   │       └── route.ts      # Handle OAuth callback
│   │   │   ├── disconnect/
│   │   │   │   └── route.ts          # Disconnect account
│   │   │   └── refresh/
│   │   │       └── route.ts          # Refresh tokens
│   │   └── connections/
│   │       └── route.ts               # Get user's connections
│   └── (main)/dashboard/connections/  # Frontend UI
├── lib/
│   ├── oauth/
│   │   ├── providers/
│   │   │   ├── facebook.ts
│   │   │   ├── instagram.ts
│   │   │   ├── twitter.ts
│   │   │   └── linkedin.ts
│   │   └── utils.ts
│   └── db/
│       └── schema.ts                  # Database schema
└── types/
    └── oauth.ts                       # TypeScript types
```

---

## Step-by-Step Implementation

### Step 1: Set Up Database Schema

Create a table to store OAuth tokens and connection information:

```typescript
// lib/db/schema.ts
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const socialConnections = pgTable('social_connections', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(), // Your app's user ID
  platform: text('platform').notNull(), // 'facebook', 'instagram', etc.
  accessToken: text('access_token').notNull(), // Encrypted
  refreshToken: text('refresh_token'), // Encrypted, optional
  tokenExpiresAt: timestamp('token_expires_at'),
  platformUserId: text('platform_user_id').notNull(),
  platformUsername: text('platform_username'),
  platformProfileImage: text('platform_profile_image'),
  scopes: text('scopes').array(), // Requested permissions
  isActive: boolean('is_active').default(true),
  connectedAt: timestamp('connected_at').defaultNow(),
  lastRefreshedAt: timestamp('last_refreshed_at'),
});
```

### Step 2: Create OAuth Provider Configuration

```typescript
// lib/oauth/providers/base.ts
export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}
```

### Step 3: Implement OAuth Initiation Route

```typescript
// app/api/auth/[platform]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProviderConfig } from '@/lib/oauth/providers';

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const platform = params.platform;
  const provider = getProviderConfig(platform);
  
  if (!provider) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
  }

  // Generate state parameter for CSRF protection
  const state = crypto.randomUUID();
  
  // Store state in session/cookie (for verification in callback)
  const response = NextResponse.redirect(provider.authorizationUrl);
  response.cookies.set(`oauth_state_${platform}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });

  // Build authorization URL
  const authUrl = new URL(provider.authorizationUrl);
  authUrl.searchParams.set('client_id', provider.clientId);
  authUrl.searchParams.set('redirect_uri', provider.redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', provider.scopes.join(' '));
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
```

### Step 4: Implement OAuth Callback Handler

```typescript
// app/api/auth/[platform]/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProviderConfig, exchangeCodeForTokens } from '@/lib/oauth/providers';
import { saveConnection } from '@/lib/db/connections';

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const platform = params.platform;
  const searchParams = request.nextUrl.searchParams;
  
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle errors
  if (error) {
    return NextResponse.redirect(
      `/dashboard/connections?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      '/dashboard/connections?error=missing_parameters'
    );
  }

  // Verify state parameter (CSRF protection)
  const storedState = request.cookies.get(`oauth_state_${platform}`)?.value;
  if (storedState !== state) {
    return NextResponse.redirect(
      '/dashboard/connections?error=invalid_state'
    );
  }

  try {
    // Exchange authorization code for access token
    const tokens = await exchangeCodeForTokens(platform, code);
    
    // Fetch user profile from platform
    const userProfile = await fetchUserProfile(platform, tokens.accessToken);
    
    // Save connection to database
    const userId = await getCurrentUserId(request); // Your auth logic
    await saveConnection({
      userId,
      platform,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: tokens.expiresIn 
        ? new Date(Date.now() + tokens.expiresIn * 1000)
        : null,
      platformUserId: userProfile.id,
      platformUsername: userProfile.username,
      platformProfileImage: userProfile.profileImage,
      scopes: provider.scopes,
    });

    // Clear state cookie
    const response = NextResponse.redirect('/dashboard/connections?success=true');
    response.cookies.delete(`oauth_state_${platform}`);
    
    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      '/dashboard/connections?error=connection_failed'
    );
  }
}
```

### Step 5: Token Exchange Function

```typescript
// lib/oauth/providers/utils.ts
export async function exchangeCodeForTokens(
  platform: string,
  code: string
): Promise<OAuthTokens> {
  const provider = getProviderConfig(platform);
  
  const response = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: provider.redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}
```

---

## Platform-Specific Guides

### Facebook & Instagram

**Developer Portal**: https://developers.facebook.com

**API Name**: Facebook Graph API / Instagram Graph API

#### Setup Steps

1. **Create Facebook App**
   - Go to https://developers.facebook.com/apps/
   - Click "Create App" → Choose "Business" type
   - Add "Facebook Login" product
   - Add "Instagram Graph API" product (for Instagram)

2. **Configure OAuth Settings**
   - App Domains: `yourdomain.com`
   - Valid OAuth Redirect URIs: `https://yourdomain.com/api/auth/facebook/callback`
   - Privacy Policy URL: Required
   - Terms of Service URL: Required

3. **Required Permissions (Scopes)**
   ```typescript
   // Facebook
   scopes: [
     'pages_manage_posts',      // Post to pages
     'pages_read_engagement',    // Read insights
     'pages_show_list',          // List user's pages
     'instagram_basic',          // Instagram basic access
     'instagram_content_publish', // Post to Instagram
   ]
   ```

4. **OAuth URLs**
   ```typescript
   authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
   tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
   ```

5. **Gotchas**
   - **Instagram requires Facebook Page**: Users must have a Facebook Page connected to their Instagram Business account
   - **App Review Required**: Some permissions require Facebook App Review
   - **Token Expiration**: Long-lived tokens last 60 days, refresh before expiry
   - **Page Access Tokens**: For posting to pages, you need page-specific tokens

#### Code Example

```typescript
// lib/oauth/providers/facebook.ts
export const facebookProvider: OAuthProvider = {
  name: 'facebook',
  clientId: process.env.FACEBOOK_APP_ID!,
  clientSecret: process.env.FACEBOOK_APP_SECRET!,
  authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
  tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
  scopes: [
    'pages_manage_posts',
    'pages_read_engagement',
    'pages_show_list',
  ],
};

// Fetch user's pages
export async function fetchFacebookPages(accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
  );
  return response.json();
}

// Exchange for long-lived token
export async function getLongLivedToken(shortLivedToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${process.env.FACEBOOK_APP_ID}&` +
    `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
    `fb_exchange_token=${shortLivedToken}`
  );
  return response.json();
}
```

---

### X (Twitter)

**Developer Portal**: https://developer.twitter.com

**API Name**: Twitter API v2

#### Setup Steps

1. **Create Twitter App**
   - Go to https://developer.twitter.com/en/portal/dashboard
   - Create a new Project and App
   - Choose "Read and Write" access level (for posting)

2. **Configure OAuth Settings**
   - Callback URL: `https://yourdomain.com/api/auth/twitter/callback`
   - Website URL: `https://yourdomain.com`

3. **Required Permissions**
   ```typescript
   scopes: [
     'tweet.read',        // Read tweets
     'tweet.write',      // Post tweets
     'users.read',       // Read user profile
     'offline.access',   // Refresh token (if using OAuth 2.0)
   ]
   ```

4. **OAuth URLs**
   ```typescript
   // OAuth 2.0 (Recommended)
   authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
   tokenUrl: 'https://api.twitter.com/2/oauth2/token',
   
   // OAuth 1.0a (Alternative, more complex)
   // Twitter supports both, but OAuth 2.0 is simpler
   ```

5. **Gotchas**
   - **API Tiers**: Free tier has rate limits (1,500 tweets/month)
   - **OAuth 2.0 vs 1.0a**: Use OAuth 2.0 for simplicity
   - **Tweet Length**: 280 characters (or 25,000 for Twitter Blue)
   - **Media Upload**: Requires separate endpoint

#### Code Example

```typescript
// lib/oauth/providers/twitter.ts
export const twitterProvider: OAuthProvider = {
  name: 'twitter',
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
  tokenUrl: 'https://api.twitter.com/2/oauth2/token',
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
  scopes: [
    'tweet.read',
    'tweet.write',
    'users.read',
    'offline.access',
  ],
};

// Post a tweet
export async function postTweet(accessToken: string, text: string) {
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  return response.json();
}
```

---

### LinkedIn

**Developer Portal**: https://www.linkedin.com/developers

**API Name**: LinkedIn API

#### Setup Steps

1. **Create LinkedIn App**
   - Go to https://www.linkedin.com/developers/apps
   - Create a new app
   - Request access to "Marketing Developer Platform" (for posting)

2. **Configure OAuth Settings**
   - Authorized redirect URLs: `https://yourdomain.com/api/auth/linkedin/callback`
   - Products: Request "Share on LinkedIn" and "Sign In with LinkedIn"

3. **Required Permissions**
   ```typescript
   scopes: [
     'openid',                    // Basic profile
     'profile',                    // Full profile
     'email',                      // Email address
     'w_member_social',            // Post to LinkedIn
   ]
   ```

4. **OAuth URLs**
   ```typescript
   authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
   tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
   ```

5. **Gotchas**
   - **Partnership Required**: Some features require LinkedIn partnership
   - **Content Format**: LinkedIn has specific content format requirements
   - **Company Pages**: Different API endpoints for personal vs company posts
   - **Rate Limits**: Strict rate limits, monitor usage

#### Code Example

```typescript
// lib/oauth/providers/linkedin.ts
export const linkedinProvider: OAuthProvider = {
  name: 'linkedin',
  clientId: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`,
  scopes: [
    'openid',
    'profile',
    'email',
    'w_member_social',
  ],
};

// Post to LinkedIn
export async function postToLinkedIn(
  accessToken: string,
  text: string,
  authorUrn: string // User's LinkedIn URN
) {
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${authorUrn}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });
  return response.json();
}
```

---

### Additional Platforms

#### TikTok
- **Developer Portal**: https://developers.tiktok.com
- **API**: TikTok Marketing API
- **Note**: Requires business verification and approval

#### YouTube
- **Developer Portal**: https://developers.google.com/youtube
- **API**: YouTube Data API v3
- **Note**: OAuth 2.0 with Google, can manage YouTube channels

#### Pinterest
- **Developer Portal**: https://developers.pinterest.com
- **API**: Pinterest API v5
- **Note**: Requires business account and app approval

---

## Security Best Practices

### 1. Encrypt Tokens at Rest

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32-byte key
const IV_LENGTH = 16;

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(token);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptToken(encryptedToken: string): string {
  const parts = encryptedToken.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encrypted = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

### 2. Use HTTPS Only

- Always use HTTPS in production
- Set `secure: true` for cookies
- Validate redirect URIs match your domain

### 3. State Parameter (CSRF Protection)

- Generate random state for each OAuth request
- Store in httpOnly cookie
- Verify in callback

### 4. Token Refresh Strategy

```typescript
// lib/oauth/token-refresh.ts
export async function refreshTokenIfNeeded(connection: SocialConnection) {
  if (!connection.tokenExpiresAt) return connection.accessToken;
  
  const expiresIn = connection.tokenExpiresAt.getTime() - Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes before expiry
  
  if (expiresIn < bufferTime) {
    // Refresh token
    const newTokens = await refreshAccessToken(connection.platform, connection.refreshToken);
    await updateConnection(connection.id, {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken || connection.refreshToken,
      tokenExpiresAt: newTokens.expiresIn 
        ? new Date(Date.now() + newTokens.expiresIn * 1000)
        : null,
    });
    return newTokens.accessToken;
  }
  
  return connection.accessToken;
}
```

### 5. Environment Variables

```bash
# .env.local
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
ENCRYPTION_KEY=your_32_byte_hex_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Token Management

### Database Functions

```typescript
// lib/db/connections.ts
import { db } from './client';
import { socialConnections } from './schema';
import { encryptToken, decryptToken } from '@/lib/oauth/encryption';

export async function saveConnection(data: {
  userId: string;
  platform: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  platformUserId: string;
  platformUsername?: string;
  platformProfileImage?: string;
  scopes: string[];
}) {
  return db.insert(socialConnections).values({
    id: crypto.randomUUID(),
    userId: data.userId,
    platform: data.platform,
    accessToken: encryptToken(data.accessToken),
    refreshToken: data.refreshToken ? encryptToken(data.refreshToken) : null,
    tokenExpiresAt: data.tokenExpiresAt,
    platformUserId: data.platformUserId,
    platformUsername: data.platformUsername,
    platformProfileImage: data.platformProfileImage,
    scopes: data.scopes,
    isActive: true,
  });
}

export async function getConnections(userId: string) {
  const connections = await db
    .select()
    .from(socialConnections)
    .where(
      and(
        eq(socialConnections.userId, userId),
        eq(socialConnections.isActive, true)
      )
    );
  
  // Decrypt tokens when needed (only in secure server context)
  return connections.map(conn => ({
    ...conn,
    accessToken: decryptToken(conn.accessToken), // Only decrypt when using
  }));
}
```

---

## Testing & Troubleshooting

### Common Issues

1. **"Invalid redirect_uri"**
   - Ensure redirect URI exactly matches what's configured in developer portal
   - Check for trailing slashes, http vs https

2. **"Invalid client_id"**
   - Verify environment variables are set correctly
   - Check if app is in development mode (some platforms restrict production)

3. **"Token expired"**
   - Implement token refresh logic
   - Check token expiration times

4. **"Insufficient permissions"**
   - Verify requested scopes match what's approved
   - Some platforms require app review for certain permissions

### Testing Checklist

- [ ] OAuth flow initiates correctly
- [ ] Callback handles success case
- [ ] Callback handles error cases
- [ ] Tokens are stored encrypted
- [ ] Token refresh works
- [ ] Disconnect removes tokens
- [ ] API calls work with stored tokens
- [ ] Error messages are user-friendly

### Debugging Tips

```typescript
// Add logging (remove in production)
console.log('OAuth flow started:', { platform, state });
console.log('Token received:', { hasAccessToken: !!tokens.accessToken });
console.log('User profile:', userProfile);
```

---

## Next Steps

1. **Implement Backend Routes**: Create the API routes as outlined above
2. **Set Up Database**: Create the connections table
3. **Configure Developer Accounts**: Register apps with each platform
4. **Test OAuth Flows**: Test each platform's connection flow
5. **Implement Token Refresh**: Add automatic token refresh logic
6. **Add Error Handling**: User-friendly error messages
7. **Monitor Token Expiry**: Set up alerts for expiring tokens
8. **Rate Limiting**: Implement rate limiting for API calls

---

## Resources

- [OAuth 2.0 Specification](https://oauth.net/2/)
- [Facebook Graph API Docs](https://developers.facebook.com/docs/graph-api)
- [Twitter API v2 Docs](https://developer.twitter.com/en/docs/twitter-api)
- [LinkedIn API Docs](https://docs.microsoft.com/en-us/linkedin/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**Good luck building your Connections feature!** 🚀

