import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { permissionService } from "@/lib/services/permissions";
import { connectionPermissionManager } from "@/lib/services/connectionPermissions";
import { reflectionPermissionChecker } from "@/lib/services/reflectionPermissions";
import { auditService } from "@/lib/services/auditService";

// Types for permission contexts
export interface BasePermissionContext {
  user: any;
  supabase: any;
  permissions: any;
  isPremium: boolean;
}

export interface PostPermissionContext extends BasePermissionContext {
  postId: string;
  hasAccess: boolean;
  canReflect: boolean;
  upgradePrompt?: boolean;
}

export interface ConnectionPermissionContext extends BasePermissionContext {
  canRequest: boolean;
  canRespond: boolean;
  upgradePrompt?: boolean;
}

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  allowed: boolean;
  reason?: string;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

// Centralized permission middleware
export class PermissionMiddleware {
  private static auditLogs: AuditLogEntry[] = [];

  /**
   * Base middleware that handles authentication and permission setup
   */
  static async withPermissions<T extends BasePermissionContext>(
    request: NextRequest,
    handler: (context: T) => Promise<NextResponse>,
    options: {
      requireAuth?: boolean;
      logAccess?: boolean;
      action?: string;
      resource?: string;
    } = {}
  ): Promise<NextResponse> {
    const {
      requireAuth = true,
      logAccess = true,
      action = "access",
      resource = "unknown",
    } = options;

    try {
      const supabase = await createClient();
      let user = null;
      let permissions = null;
      let isPremium = false;

      // Get user if authentication is required or available
      if (requireAuth) {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          await this.logAccess(
            null,
            action,
            resource,
            false,
            "Não autorizado",
            undefined,
            request
          );
          return NextResponse.json(
            {
              error: "Não autorizado",
              code: "UNAUTHORIZED",
            },
            { status: 401 }
          );
        }

        user = authUser;
      } else {
        // Try to get user but don't fail if not authenticated
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        user = authUser;
      }

      // Get permissions if user is authenticated
      if (user) {
        permissions = await permissionService.getUserPermissions(user.id);
        const premiumStatus = await permissionService.getUserPremiumStatus(
          user.id
        );
        isPremium = premiumStatus?.isPremium || false;
      }

      // Create base context
      const context = {
        user,
        supabase,
        permissions,
        isPremium,
      } as T;

      // Log access if enabled
      if (logAccess && user) {
        await this.logAccess(
          user.id,
          action,
          resource,
          true,
          undefined,
          undefined,
          request
        );
      }

      return await handler(context);
    } catch (error) {
      console.error("Error in permission middleware:", error);

      if (options.logAccess) {
        await this.logAccess(
          null,
          action,
          resource,
          false,
          "Erro interno",
          undefined,
          request
        );
      }

      return NextResponse.json(
        {
          error: "Erro interno do servidor",
          code: "INTERNAL_ERROR",
        },
        { status: 500 }
      );
    }
  }

  /**
   * Middleware for post-related permissions
   */
  static async withPostPermissions(
    request: NextRequest,
    postId: string,
    handler: (context: PostPermissionContext) => Promise<NextResponse>,
    options: {
      requireAccess?: boolean;
      requireReflectionPermission?: boolean;
    } = {}
  ): Promise<NextResponse> {
    const { requireAccess = true, requireReflectionPermission = false } =
      options;

    return this.withPermissions<PostPermissionContext>(
      request,
      async (baseContext) => {
        try {
          // Check post access
          const accessResult = await permissionService.checkPostAccess(
            baseContext.user.id,
            postId
          );

          // Check reflection permissions
          const reflectionResult =
            await reflectionPermissionChecker.canCreateReflection(
              baseContext.user.id,
              postId
            );

          const context: PostPermissionContext = {
            ...baseContext,
            postId,
            hasAccess: accessResult.allowed,
            canReflect: reflectionResult.allowed,
            upgradePrompt:
              accessResult.upgradePrompt || reflectionResult.upgradePrompt,
          };

          // Log the permission check
          await this.logAccess(
            baseContext.user.id,
            "post_access",
            "post",
            accessResult.allowed,
            accessResult.reason,
            postId,
            request
          );

          // Check if access is required and denied
          if (requireAccess && !accessResult.allowed) {
            return NextResponse.json(
              {
                error: accessResult.reason || "Acesso negado ao post",
                upgradePrompt: accessResult.upgradePrompt || false,
                code: "POST_ACCESS_DENIED",
              },
              { status: 403 }
            );
          }

          // Check if reflection permission is required and denied
          if (requireReflectionPermission && !reflectionResult.allowed) {
            return NextResponse.json(
              {
                error:
                  reflectionResult.reason ||
                  "Não é possível criar reflexão neste post",
                upgradePrompt: reflectionResult.upgradePrompt || false,
                code: "REFLECTION_DENIED",
              },
              { status: 403 }
            );
          }

          return await handler(context);
        } catch (error) {
          console.error("Error in post permissions middleware:", error);
          return NextResponse.json(
            {
              error: "Erro ao verificar permissões do post",
              code: "PERMISSION_CHECK_ERROR",
            },
            { status: 500 }
          );
        }
      },
      {
        requireAuth: true,
        logAccess: true,
        action: "post_access",
        resource: "post",
      }
    );
  }

  /**
   * Middleware for connection-related permissions
   */
  static async withConnectionPermissions(
    request: NextRequest,
    handler: (context: ConnectionPermissionContext) => Promise<NextResponse>,
    options: {
      requireRequestPermission?: boolean;
      requireResponsePermission?: boolean;
    } = {}
  ): Promise<NextResponse> {
    const {
      requireRequestPermission = false,
      requireResponsePermission = false,
    } = options;

    return this.withPermissions<ConnectionPermissionContext>(
      request,
      async (baseContext) => {
        try {
          // Check connection permissions
          const canRequest =
            await connectionPermissionManager.canRequestConnection(
              baseContext.user.id
            );
          const canRespond =
            await connectionPermissionManager.canRespondToConnection(
              baseContext.user.id
            );

          const context: ConnectionPermissionContext = {
            ...baseContext,
            canRequest,
            canRespond,
            upgradePrompt: !canRequest && !baseContext.isPremium,
          };

          // Log the permission check
          await this.logAccess(
            baseContext.user.id,
            "connection_access",
            "connection",
            canRequest || canRespond,
            !canRequest
              ? "Utilizador gratuito não pode solicitar conexões"
              : undefined,
            undefined,
            request
          );

          // Check if request permission is required and denied
          if (requireRequestPermission && !canRequest) {
            return NextResponse.json(
              {
                error: "Utilizadores gratuitos não podem solicitar conexões",
                upgradePrompt: true,
                code: "CONNECTION_REQUEST_DENIED",
              },
              { status: 403 }
            );
          }

          // Check if response permission is required and denied
          if (requireResponsePermission && !canRespond) {
            return NextResponse.json(
              {
                error: "Não é possível responder a conexões",
                upgradePrompt: false,
                code: "CONNECTION_RESPONSE_DENIED",
              },
              { status: 403 }
            );
          }

          return await handler(context);
        } catch (error) {
          console.error("Error in connection permissions middleware:", error);
          return NextResponse.json(
            {
              error: "Erro ao verificar permissões de conexão",
              code: "PERMISSION_CHECK_ERROR",
            },
            { status: 500 }
          );
        }
      },
      {
        requireAuth: true,
        logAccess: true,
        action: "connection_access",
        resource: "connection",
      }
    );
  }

  /**
   * Decorator for API routes that need permission checking
   */
  static requirePermissions(options: {
    type: "post" | "connection" | "general";
    postId?: string;
    requireAccess?: boolean;
    requireReflectionPermission?: boolean;
    requireRequestPermission?: boolean;
    requireResponsePermission?: boolean;
  }) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (request: NextRequest, context?: any) {
        const { type, postId, ...permissionOptions } = options;

        switch (type) {
          case "post":
            if (!postId && !context?.params?.id) {
              throw new Error("Post ID is required for post permissions");
            }
            const actualPostId = postId || context?.params?.id;
            return PermissionMiddleware.withPostPermissions(
              request,
              actualPostId,
              originalMethod.bind(this),
              permissionOptions
            );

          case "connection":
            return PermissionMiddleware.withConnectionPermissions(
              request,
              originalMethod.bind(this),
              permissionOptions
            );

          case "general":
          default:
            return PermissionMiddleware.withPermissions(
              request,
              originalMethod.bind(this),
              {
                requireAuth: true,
                logAccess: true,
                action: propertyKey,
                resource: "api",
              }
            );
        }
      };

      return descriptor;
    };
  }

  /**
   * Log access attempts for audit purposes
   */
  private static async logAccess(
    userId: string | null,
    action: string,
    resource: string,
    allowed: boolean,
    reason?: string,
    resourceId?: string,
    request?: NextRequest
  ): Promise<void> {
    if (!userId) return;

    try {
      const userAgent = request?.headers.get("user-agent") || undefined;
      const ip =
        request?.headers.get("x-forwarded-for") ||
        request?.headers.get("x-real-ip") ||
        undefined;

      if (allowed) {
        await auditService.logSuccessfulAccess(userId, action, resource, {
          resourceId,
          userAgent,
          ip,
          metadata: { timestamp: new Date().toISOString() },
        });
      } else {
        await auditService.logPermissionDenial(
          userId,
          action,
          resource,
          reason || "Acesso negado",
          {
            resourceId,
            userAgent,
            ip,
            metadata: { timestamp: new Date().toISOString() },
          }
        );
      }
    } catch (error) {
      console.error("Error logging access:", error);
      // Fallback to in-memory logging
      const logEntry: AuditLogEntry = {
        userId: userId || "anonymous",
        action,
        resource,
        resourceId,
        allowed,
        reason,
        timestamp: new Date(),
        userAgent: request?.headers.get("user-agent") || undefined,
        ip: request?.headers.get("x-forwarded-for") || undefined,
      };

      this.auditLogs.push(logEntry);

      // Keep only last 1000 entries to prevent memory issues
      if (this.auditLogs.length > 1000) {
        this.auditLogs = this.auditLogs.slice(-1000);
      }
    }
  }

  /**
   * Get audit logs (for admin/monitoring purposes)
   */
  static getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    allowed?: boolean;
    since?: Date;
  }): AuditLogEntry[] {
    let logs = [...this.auditLogs];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter((log) => log.userId === filters.userId);
      }
      if (filters.action) {
        logs = logs.filter((log) => log.action === filters.action);
      }
      if (filters.resource) {
        logs = logs.filter((log) => log.resource === filters.resource);
      }
      if (filters.allowed !== undefined) {
        logs = logs.filter((log) => log.allowed === filters.allowed);
      }
      if (filters.since) {
        logs = logs.filter((log) => log.timestamp >= filters.since!);
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clear audit logs (for testing or maintenance)
   */
  static clearAuditLogs(): void {
    this.auditLogs = [];
  }
}

// Export convenience functions for backward compatibility
export const withPermissions =
  PermissionMiddleware.withPermissions.bind(PermissionMiddleware);
export const withPostPermissions =
  PermissionMiddleware.withPostPermissions.bind(PermissionMiddleware);
export const withConnectionPermissions =
  PermissionMiddleware.withConnectionPermissions.bind(PermissionMiddleware);
export const requirePermissions =
  PermissionMiddleware.requirePermissions.bind(PermissionMiddleware);

// Export the class as default
export default PermissionMiddleware;
