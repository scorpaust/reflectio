# Design Document - Correção de Permissões de Utilizadores

## Overview

Este documento define a arquitetura técnica para implementar as correções de permissões entre utilizadores gratuitos e premium no sistema Reflectio. O design foca em criar um sistema de controle de acesso baseado no status premium do utilizador, garantindo que as funcionalidades sejam aplicadas corretamente conforme definido nos requisitos.

## Architecture

### Current System Analysis

**Database Structure:**

- `profiles` table: Contém `is_premium`, `premium_expires_at`, `premium_since`
- `posts` table: Contém `is_premium_content` para marcar conteúdo premium
- `reflections` table: Ligada a posts através de `post_id`
- `connections` table: Gerencia conexões entre utilizadores

**Key Components:**

- Frontend: React components para UI
- Backend: Next.js API routes
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth

## Components and Interfaces

### 1. Permission Service Layer

**File:** `lib/services/permissions.ts`

```typescript
interface UserPermissions {
  canViewPremiumContent: boolean;
  canCreatePremiumContent: boolean;
  canCreateReflectionOnPost: (
    postId: string,
    postAuthorIsPremium: boolean
  ) => boolean;
  canRequestConnection: boolean;
  requiresMandatoryModeration: boolean;
}

interface PermissionService {
  getUserPermissions(userId: string): Promise<UserPermissions>;
  checkPostAccess(userId: string, postId: string): Promise<boolean>;
  checkReflectionPermission(userId: string, postId: string): Promise<boolean>;
  checkConnectionPermission(
    userId: string,
    action: "request" | "respond"
  ): Promise<boolean>;
}
```

### 2. User Context Enhancement

**File:** `lib/contexts/UserContext.tsx`

Extend existing user context to include permission checks:

```typescript
interface UserContextType {
  user: User | null;
  profile: Profile | null;
  permissions: UserPermissions | null;
  isPremium: boolean;
  isLoading: boolean;
}
```

### 3. Post Filtering Service

**File:** `lib/services/postFiltering.ts`

```typescript
interface PostFilter {
  filterPostsForUser(posts: Post[], userId: string): Promise<Post[]>;
  getVisiblePostsQuery(userId: string): string;
}
```

### 4. Reflection Permission Checker

**File:** `lib/services/reflectionPermissions.ts`

```typescript
interface ReflectionPermissionChecker {
  canCreateReflection(
    userId: string,
    postId: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
    upgradePrompt?: boolean;
  }>;
}
```

### 5. Connection Permission Manager

**File:** `lib/services/connectionPermissions.ts`

```typescript
interface ConnectionPermissionManager {
  canRequestConnection(requesterId: string): Promise<boolean>;
  canRespondToConnection(userId: string): Promise<boolean>;
  getConnectionActions(userId: string): Promise<ConnectionAction[]>;
}
```

## Data Models

### Enhanced Profile Model

```typescript
interface EnhancedProfile extends Profile {
  // Computed fields
  isPremiumActive: boolean;
  premiumStatus: "active" | "expired" | "never";
  permissionLevel: "free" | "premium";
}
```

### Post with Access Control

```typescript
interface PostWithAccess extends Post {
  // Computed fields
  canView: boolean;
  canReflect: boolean;
  authorIsPremium: boolean;
  requiresUpgrade: boolean;
}
```

### Reflection Permission Result

```typescript
interface ReflectionPermissionResult {
  allowed: boolean;
  reason?: "premium_content" | "premium_author" | "not_premium_user";
  message?: string;
  upgradePrompt?: boolean;
}
```

## Error Handling

### Permission Denied Responses

```typescript
interface PermissionError {
  code: "PERMISSION_DENIED";
  type: "premium_required" | "content_restricted" | "action_not_allowed";
  message: string;
  upgradeUrl?: string;
  allowedActions?: string[];
}
```

### Graceful Degradation

- Show limited previews for premium content
- Display upgrade prompts instead of errors
- Provide clear explanations for restrictions
- Offer alternative actions when possible

## Testing Strategy

### Unit Tests

1. **Permission Service Tests**

   - Test premium status detection
   - Test permission calculations
   - Test edge cases (expired premium, etc.)

2. **Post Filtering Tests**

   - Test content visibility rules
   - Test reflection permission logic
   - Test premium content access

3. **Connection Permission Tests**
   - Test request/response permissions
   - Test free user limitations
   - Test premium user capabilities

### Integration Tests

1. **API Endpoint Tests**

   - Test protected routes
   - Test permission middleware
   - Test error responses

2. **Component Tests**
   - Test UI permission states
   - Test upgrade prompts
   - Test restricted action handling

### E2E Tests

1. **User Journey Tests**
   - Free user experience flow
   - Premium user experience flow
   - Upgrade conversion flow

## Implementation Phases

### Phase 1: Core Permission System

- Create permission service layer
- Implement user permission detection
- Add permission context to user state

### Phase 2: Content Access Control

- Implement post filtering for premium content
- Add reflection permission checking
- Update post display components

### Phase 3: Connection Restrictions

- Implement connection permission logic
- Update connection UI components
- Add upgrade prompts for restricted actions

### Phase 4: Moderation Intelligence

- Implement smart moderation for premium users
- Keep mandatory moderation for free users
- Add moderation bypass logic

### Phase 5: UI/UX Enhancements

- Add upgrade prompts and messaging
- Implement graceful permission denials
- Add premium feature previews

## Security Considerations

### Server-Side Validation

- All permission checks must be validated on the server
- Client-side checks are for UX only
- API endpoints must enforce permissions

### Data Protection

- Premium content must be filtered at query level
- No premium data should reach free users
- Audit logs for permission violations

### Rate Limiting

- Different limits for free vs premium users
- Stricter limits on restricted actions
- Progressive restrictions for abuse

## Performance Considerations

### Caching Strategy

- Cache user permission states
- Cache premium status checks
- Invalidate cache on subscription changes

### Database Optimization

- Add indexes for permission queries
- Optimize post filtering queries
- Use database-level filtering where possible

### Client-Side Optimization

- Lazy load premium features
- Preload permission states
- Minimize permission check calls

## Monitoring and Analytics

### Permission Metrics

- Track permission denial rates
- Monitor upgrade conversion from restrictions
- Measure feature usage by user type

### Performance Metrics

- Permission check response times
- Database query performance
- Cache hit rates

### User Experience Metrics

- User frustration indicators
- Upgrade prompt effectiveness
- Feature discovery rates
