# Janua Authentication Integration Guide

## Overview

Janua is the unified authentication infrastructure for all MADFAM ecosystem applications. This guide covers how to integrate Janua auth across all services for "maximum dogfooding".

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MADFAM ECOSYSTEM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐    JWT Tokens     ┌─────────────┐                        │
│   │   Janua     │◄─────────────────►│   Cotiza    │                        │
│   │   Auth      │                   │   (NestJS)  │                        │
│   │   (FastAPI) │    JWT Tokens     ├─────────────┤                        │
│   │             │◄─────────────────►│  Forgesight │                        │
│   │   :4100     │                   │  (FastAPI)  │                        │
│   │             │    JWT Tokens     ├─────────────┤                        │
│   │             │◄─────────────────►│ MADFAM Site │                        │
│   └─────────────┘                   │  (Next.js)  │                        │
│         │                           └─────────────┘                        │
│         │                                                                   │
│         ▼                                                                   │
│   ┌─────────────┐                                                          │
│   │  PostgreSQL │  (Shared user/tenant data)                               │
│   │   + Redis   │  (Session management)                                    │
│   └─────────────┘                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Janua API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | User registration |
| `/auth/login` | POST | User login (returns JWT) |
| `/auth/refresh` | POST | Refresh access token |
| `/auth/logout` | POST | Invalidate session |
| `/users/me` | GET | Get current user |
| `/organizations` | GET/POST | Organization management |

## Available SDKs

| SDK | Package | Use Case |
|-----|---------|----------|
| **TypeScript** | `@janua/typescript-sdk` | Backend services (NestJS, Express) |
| **Next.js** | `@janua/nextjs` | Next.js applications |
| **Python** | `janua` | FastAPI/Python services |
| **React** | `@janua/react-sdk` | React SPAs |

---

## Integration Patterns

### 1. Next.js Applications (MADFAM Site, Cotiza Web)

#### Installation
```bash
npm install @janua/nextjs
# or from local monorepo
npm link ../janua/packages/nextjs-sdk
```

#### Environment Variables
```env
# Port 4100 per PORT_ALLOCATION.md (Janua block: 4100-4199)
JANUA_API_URL=http://localhost:4100
JANUA_JWT_SECRET=your-shared-jwt-secret
NEXT_PUBLIC_JANUA_URL=http://localhost:4100
```

#### Middleware Setup (`middleware.ts`)
```typescript
import { withAuth } from '@janua/nextjs/middleware';

export default withAuth({
  publicRoutes: ['/', '/login', '/signup', '/api/health'],
  protectedRoutes: ['/dashboard/*', '/settings/*'],
  redirectUrl: '/login',
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

#### Provider Setup (`app/providers.tsx`)
```typescript
'use client';
import { JanuaProvider } from '@janua/nextjs';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JanuaProvider
      apiUrl={process.env.NEXT_PUBLIC_JANUA_URL!}
      cookieName="janua-session"
    >
      {children}
    </JanuaProvider>
  );
}
```

#### Using Auth Components
```typescript
import { 
  SignInForm, 
  SignUpForm, 
  UserButton, 
  SignedIn, 
  SignedOut,
  useAuth,
  useUser 
} from '@janua/nextjs';

export default function Header() {
  return (
    <header>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <a href="/login">Sign In</a>
      </SignedOut>
    </header>
  );
}
```

#### Server-Side Auth (`app/api/route.ts`)
```typescript
import { getSession, requireAuth } from '@janua/nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const session = await getSession(cookies());
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return Response.json({ user: session.user });
}
```

---

### 2. NestJS Applications (Cotiza API)

#### Installation
```bash
npm install @janua/typescript-sdk jose
```

#### Environment Variables
```env
# Port 4100 per PORT_ALLOCATION.md (Janua block: 4100-4199)
JANUA_API_URL=http://janua-api:4100
JANUA_JWT_SECRET=your-shared-jwt-secret
```

#### JWT Strategy (`src/auth/janua-jwt.strategy.ts`)
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JanuaJwtStrategy extends PassportStrategy(Strategy, 'janua-jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JANUA_JWT_SECRET'),
      issuer: 'janua',
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }
    
    return {
      userId: payload.sub,
      email: payload.email,
      organizationId: payload.org_id,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
    };
  }
}
```

#### Auth Guard (`src/auth/janua-auth.guard.ts`)
```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JanuaAuthGuard extends AuthGuard('janua-jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

#### Auth Module (`src/auth/auth.module.ts`)
```typescript
import { Module, Global } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JanuaJwtStrategy } from './janua-jwt.strategy';
import { JanuaAuthGuard } from './janua-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'janua-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JANUA_JWT_SECRET'),
        signOptions: { 
          issuer: 'janua',
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    JanuaJwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JanuaAuthGuard,
    },
  ],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
```

#### Usage in Controllers
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JanuaAuthGuard } from './auth/janua-auth.guard';
import { Public } from './auth/public.decorator';
import { CurrentUser } from './auth/current-user.decorator';

@Controller('quotes')
export class QuotesController {
  @Public()
  @Get('public')
  getPublicQuotes() {
    return { quotes: [] };
  }

  @Get('my-quotes')
  getMyQuotes(@CurrentUser() user: any) {
    return { userId: user.userId, quotes: [] };
  }
}
```

---

### 3. FastAPI Applications (Forgesight API)

#### Installation
```bash
pip install python-jose[cryptography] httpx
# Or from local: pip install -e ../janua/packages/python-sdk
```

#### Environment Variables
```env
# Port 4100 per PORT_ALLOCATION.md (Janua block: 4100-4199)
JANUA_API_URL=http://janua-api:4100
JANUA_JWT_SECRET=your-shared-jwt-secret
```

#### Janua Auth Dependency (`app/core/janua_auth.py`)
```python
import os
from typing import Optional, Dict, Any
from datetime import datetime

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

JANUA_JWT_SECRET = os.getenv("JANUA_JWT_SECRET")
JANUA_ALGORITHM = "HS256"

security_scheme = HTTPBearer(auto_error=False)


class JanuaAuthError(HTTPException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )


def verify_janua_token(token: str) -> Dict[str, Any]:
    """Verify a Janua JWT token."""
    try:
        payload = jwt.decode(
            token, 
            JANUA_JWT_SECRET, 
            algorithms=[JANUA_ALGORITHM],
            options={"verify_iss": True},
            issuer="janua"
        )
        
        # Check expiration
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise JanuaAuthError("Token has expired")
            
        return payload
    except JWTError as e:
        raise JanuaAuthError(f"Invalid token: {str(e)}")


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Dict[str, Any]:
    """Get current user from Janua JWT token."""
    if not credentials:
        raise JanuaAuthError("Missing authentication credentials")
    
    payload = verify_janua_token(credentials.credentials)
    
    return {
        "user_id": payload.get("sub"),
        "email": payload.get("email"),
        "organization_id": payload.get("org_id"),
        "roles": payload.get("roles", []),
        "permissions": payload.get("permissions", []),
    }


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Optional[Dict[str, Any]]:
    """Get current user if authenticated, None otherwise."""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except JanuaAuthError:
        return None


def require_permission(permission: str):
    """Dependency to require specific permission."""
    async def check_permission(user: Dict = Depends(get_current_user)):
        if permission not in user.get("permissions", []) and "admin" not in user.get("roles", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required permission: {permission}"
            )
        return user
    return check_permission
```

#### Usage in Routes
```python
from fastapi import APIRouter, Depends
from app.core.janua_auth import get_current_user, get_optional_user, require_permission

router = APIRouter()


@router.get("/public")
async def public_endpoint():
    """Public endpoint - no auth required."""
    return {"message": "Hello, world!"}


@router.get("/protected")
async def protected_endpoint(user: dict = Depends(get_current_user)):
    """Protected endpoint - requires valid Janua token."""
    return {"user_id": user["user_id"], "email": user["email"]}


@router.post("/admin")
async def admin_endpoint(user: dict = Depends(require_permission("admin:write"))):
    """Admin endpoint - requires specific permission."""
    return {"admin_user": user["user_id"]}
```

---

## Shared JWT Secret Configuration

All services MUST use the same JWT secret to validate tokens issued by Janua.

### Development
```bash
# Generate a secure secret
openssl rand -base64 32

# Set in all .env files
JANUA_JWT_SECRET=your-generated-secret-here
```

### Production (docker-compose.production.yml)
```yaml
services:
  janua-api:
    environment:
      JWT_SECRET: ${JANUA_JWT_SECRET}
      
  cotiza-api:
    environment:
      JANUA_JWT_SECRET: ${JANUA_JWT_SECRET}
      
  forgesight-api:
    environment:
      JANUA_JWT_SECRET: ${JANUA_JWT_SECRET}
      
  madfam-site:
    environment:
      JANUA_JWT_SECRET: ${JANUA_JWT_SECRET}
```

---

## Token Structure

Janua JWT tokens contain:

```json
{
  "sub": "user_id_uuid",
  "email": "user@example.com",
  "org_id": "organization_id_uuid",
  "roles": ["user", "admin"],
  "permissions": ["read", "write", "admin:read"],
  "iss": "janua",
  "iat": 1699999999,
  "exp": 1700003599
}
```

---

## Cross-Service Authentication Flow

```
1. User logs in via MADFAM Site or Cotiza Web
   └─► POST /auth/login to Janua API
   
2. Janua validates credentials, returns JWT
   └─► JWT stored in httpOnly cookie (web) or localStorage (mobile)

3. User accesses Cotiza API
   └─► Request includes Authorization: Bearer <jwt>
   └─► Cotiza validates JWT using shared secret
   └─► Request proceeds with user context

4. Cotiza needs Forgesight data
   └─► Service-to-service call with same JWT
   └─► Or internal API key for service accounts

5. Token refresh
   └─► Before expiry, client calls /auth/refresh
   └─► New JWT issued, old one invalidated
```

---

## Testing Unified Auth

```bash
# Port 4100 per PORT_ALLOCATION.md (Janua block: 4100-4199)

# 1. Register user via Janua
curl -X POST http://localhost:4100/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!"}'

# 2. Login to get JWT
TOKEN=$(curl -X POST http://localhost:4100/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!"}' \
  | jq -r '.access_token')

# 3. Access Cotiza API with Janua token (port 4500)
curl http://localhost:4500/api/v1/quotes \
  -H "Authorization: Bearer $TOKEN"

# 4. Access ForgeSight API with same token (port 4300)
curl http://localhost:4300/api/v1/vendors \
  -H "Authorization: Bearer $TOKEN"

# 5. Access Enclii API with same token (port 4200)
curl http://localhost:4200/api/v1/projects \
  -H "Authorization: Bearer $TOKEN"
```

---

## Migration Checklist

### Cotiza API
- [ ] Install `@janua/typescript-sdk` and `passport-jwt`
- [ ] Create `JanuaJwtStrategy`
- [ ] Create `JanuaAuthGuard` 
- [ ] Update `AuthModule` to use Janua
- [ ] Add `JANUA_JWT_SECRET` to environment
- [ ] Test protected endpoints

### Forgesight API
- [ ] Create `janua_auth.py` module
- [ ] Replace existing auth with Janua dependencies
- [ ] Add `JANUA_JWT_SECRET` to environment
- [ ] Test protected endpoints

### MADFAM Site
- [ ] Install `@janua/nextjs`
- [ ] Configure middleware
- [ ] Add `JanuaProvider` to layout
- [ ] Replace auth components
- [ ] Test login/logout flow

### Cotiza Web
- [ ] Install `@janua/nextjs`
- [ ] Configure middleware
- [ ] Add `JanuaProvider` to layout
- [ ] Test protected routes
