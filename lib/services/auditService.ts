import { createClient } from "@/lib/supabase/server";

export interface AuditLogEntry {
  id?: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  allowed: boolean;
  reason?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  sessionId?: string;
}

export interface SecurityAlert {
  id?: string;
  userId: string;
  alertType:
    | "suspicious_activity"
    | "permission_bypass_attempt"
    | "rate_limit_exceeded"
    | "unusual_pattern";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

export interface UsageMetrics {
  userId: string;
  userType: "free" | "premium";
  date: string; // YYYY-MM-DD format
  actions: {
    posts_viewed: number;
    posts_created: number;
    reflections_created: number;
    connections_requested: number;
    connections_responded: number;
    premium_content_accessed: number;
    upgrade_prompts_shown: number;
    upgrade_prompts_clicked: number;
  };
}

export class AuditService {
  private static instance: AuditService;
  private async getSupabase() {
    return await createClient();
  }

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Log an access attempt or permission check
   */
  async logAccess(
    entry: Omit<AuditLogEntry, "id" | "timestamp">
  ): Promise<void> {
    try {
      const logEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date(),
      };

      // In development, log to console
      if (process.env.NODE_ENV === "development") {
        console.log("Audit Log:", logEntry);
      }

      // Store in database
      const supabase = await this.getSupabase();
      await supabase.from("audit_logs").insert({
        user_id: logEntry.userId,
        action: logEntry.action,
        resource: logEntry.resource,
        resource_id: logEntry.resourceId,
        allowed: logEntry.allowed,
        reason: logEntry.reason,
        metadata: logEntry.metadata,
        user_agent: logEntry.userAgent,
        ip_address: logEntry.ip,
        session_id: logEntry.sessionId,
        created_at: logEntry.timestamp.toISOString(),
      });

      // Check for suspicious patterns
      await this.checkForSuspiciousActivity(logEntry);
    } catch (error) {
      console.error("Error logging audit entry:", error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Log a permission denial with detailed context
   */
  async logPermissionDenial(
    userId: string,
    action: string,
    resource: string,
    reason: string,
    context?: {
      resourceId?: string;
      userAgent?: string;
      ip?: string;
      sessionId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await this.logAccess({
      userId,
      action,
      resource,
      resourceId: context?.resourceId,
      allowed: false,
      reason,
      metadata: context?.metadata,
      userAgent: context?.userAgent,
      ip: context?.ip,
      sessionId: context?.sessionId,
    });
  }

  /**
   * Log successful access with context
   */
  async logSuccessfulAccess(
    userId: string,
    action: string,
    resource: string,
    context?: {
      resourceId?: string;
      userAgent?: string;
      ip?: string;
      sessionId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await this.logAccess({
      userId,
      action,
      resource,
      resourceId: context?.resourceId,
      allowed: true,
      metadata: context?.metadata,
      userAgent: context?.userAgent,
      ip: context?.ip,
      sessionId: context?.sessionId,
    });
  }

  /**
   * Track usage metrics by user type
   */
  async trackUsageMetrics(
    userId: string,
    userType: "free" | "premium",
    action: keyof UsageMetrics["actions"],
    count: number = 1
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Get or create today's metrics
      const supabase = await this.getSupabase();
      const { data: existingMetrics } = await supabase
        .from("usage_metrics")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

      if (existingMetrics) {
        // Update existing metrics
        const updatedActions = {
          ...((existingMetrics.actions as Record<string, number>) || {}),
        };
        updatedActions[action] = (updatedActions[action] || 0) + count;

        await supabase
          .from("usage_metrics")
          .update({
            actions: updatedActions,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingMetrics.id);
      } else {
        // Create new metrics entry
        const actions = {
          posts_viewed: 0,
          posts_created: 0,
          reflections_created: 0,
          connections_requested: 0,
          connections_responded: 0,
          premium_content_accessed: 0,
          upgrade_prompts_shown: 0,
          upgrade_prompts_clicked: 0,
        };
        actions[action] = count;

        await supabase.from("usage_metrics").insert({
          user_id: userId,
          user_type: userType,
          date: today,
          actions,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error tracking usage metrics:", error);
    }
  }

  /**
   * Create a security alert
   */
  async createSecurityAlert(
    alert: Omit<SecurityAlert, "id" | "timestamp" | "resolved">
  ): Promise<void> {
    try {
      const securityAlert: SecurityAlert = {
        ...alert,
        timestamp: new Date(),
        resolved: false,
      };

      const supabase = await this.getSupabase();
      await supabase.from("security_alerts").insert({
        user_id: securityAlert.userId,
        alert_type: securityAlert.alertType,
        severity: securityAlert.severity,
        description: securityAlert.description,
        metadata: securityAlert.metadata,
        resolved: securityAlert.resolved,
        created_at: securityAlert.timestamp.toISOString(),
      });

      // Log critical alerts to console immediately
      if (securityAlert.severity === "critical") {
        console.error("CRITICAL SECURITY ALERT:", securityAlert);
      }
    } catch (error) {
      console.error("Error creating security alert:", error);
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  private async checkForSuspiciousActivity(
    entry: AuditLogEntry
  ): Promise<void> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Get recent failed attempts by this user
      const supabase = await this.getSupabase();
      const { data: recentFailures } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", entry.userId)
        .eq("allowed", false)
        .gte("created_at", oneHourAgo.toISOString())
        .order("created_at", { ascending: false });

      if (recentFailures && recentFailures.length >= 10) {
        await this.createSecurityAlert({
          userId: entry.userId,
          alertType: "suspicious_activity",
          severity: "medium",
          description: `Utilizador ${entry.userId} teve ${recentFailures.length} tentativas de acesso negadas na última hora`,
          metadata: {
            failureCount: recentFailures.length,
            timeWindow: "1 hour",
            actions: recentFailures.map((f) => f.action),
          },
        });
      }

      // Check for potential bypass attempts
      if (!entry.allowed && entry.reason?.includes("bypass")) {
        await this.createSecurityAlert({
          userId: entry.userId,
          alertType: "permission_bypass_attempt",
          severity: "high",
          description: `Possível tentativa de bypass de permissões detectada para utilizador ${entry.userId}`,
          metadata: {
            action: entry.action,
            resource: entry.resource,
            reason: entry.reason,
          },
        });
      }

      // Check for unusual patterns (e.g., free user trying to access premium content repeatedly)
      if (
        !entry.allowed &&
        entry.resource === "post" &&
        entry.reason?.includes("premium")
      ) {
        const { data: premiumAttempts } = await supabase
          .from("audit_logs")
          .select("*")
          .eq("user_id", entry.userId)
          .eq("resource", "post")
          .eq("allowed", false)
          .ilike("reason", "%premium%")
          .gte("created_at", oneHourAgo.toISOString());

        if (premiumAttempts && premiumAttempts.length >= 5) {
          await this.createSecurityAlert({
            userId: entry.userId,
            alertType: "unusual_pattern",
            severity: "low",
            description: `Utilizador gratuito ${entry.userId} tentou acessar conteúdo premium ${premiumAttempts.length} vezes na última hora`,
            metadata: {
              attemptCount: premiumAttempts.length,
              timeWindow: "1 hour",
              suggestedAction: "show_upgrade_prompt",
            },
          });
        }
      }
    } catch (error) {
      console.error("Error checking for suspicious activity:", error);
    }
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    allowed?: boolean;
    since?: Date;
    until?: Date;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    try {
      const supabase = await this.getSupabase();
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters) {
        if (filters.userId) {
          query = query.eq("user_id", filters.userId);
        }
        if (filters.action) {
          query = query.eq("action", filters.action);
        }
        if (filters.resource) {
          query = query.eq("resource", filters.resource);
        }
        if (filters.allowed !== undefined) {
          query = query.eq("allowed", filters.allowed);
        }
        if (filters.since) {
          query = query.gte("created_at", filters.since.toISOString());
        }
        if (filters.until) {
          query = query.lte("created_at", filters.until.toISOString());
        }
        if (filters.limit) {
          query = query.limit(filters.limit);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching audit logs:", error);
        return [];
      }

      return (
        data?.map((row) => ({
          id: row.id,
          userId: row.user_id,
          action: row.action,
          resource: row.resource,
          resourceId: row.resource_id || undefined,
          allowed: row.allowed,
          reason: row.reason || undefined,
          metadata: (row.metadata as Record<string, any>) || undefined,
          timestamp: new Date(row.created_at),
          userAgent: row.user_agent || undefined,
          ip: row.ip_address || undefined,
          sessionId: row.session_id || undefined,
        })) || []
      );
    } catch (error) {
      console.error("Error in getAuditLogs:", error);
      return [];
    }
  }

  /**
   * Get security alerts
   */
  async getSecurityAlerts(filters?: {
    userId?: string;
    alertType?: SecurityAlert["alertType"];
    severity?: SecurityAlert["severity"];
    resolved?: boolean;
    since?: Date;
    limit?: number;
  }): Promise<SecurityAlert[]> {
    try {
      const supabase = await this.getSupabase();
      let query = supabase
        .from("security_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters) {
        if (filters.userId) {
          query = query.eq("user_id", filters.userId);
        }
        if (filters.alertType) {
          query = query.eq("alert_type", filters.alertType);
        }
        if (filters.severity) {
          query = query.eq("severity", filters.severity);
        }
        if (filters.resolved !== undefined) {
          query = query.eq("resolved", filters.resolved);
        }
        if (filters.since) {
          query = query.gte("created_at", filters.since.toISOString());
        }
        if (filters.limit) {
          query = query.limit(filters.limit);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching security alerts:", error);
        return [];
      }

      return (
        data?.map((row) => ({
          id: row.id,
          userId: row.user_id,
          alertType: row.alert_type as SecurityAlert["alertType"],
          severity: row.severity as SecurityAlert["severity"],
          description: row.description,
          metadata: (row.metadata as Record<string, any>) || undefined,
          timestamp: new Date(row.created_at),
          resolved: row.resolved,
        })) || []
      );
    } catch (error) {
      console.error("Error in getSecurityAlerts:", error);
      return [];
    }
  }

  /**
   * Get usage metrics for analysis
   */
  async getUsageMetrics(filters?: {
    userId?: string;
    userType?: "free" | "premium";
    dateFrom?: string;
    dateTo?: string;
  }): Promise<UsageMetrics[]> {
    try {
      const supabase = await this.getSupabase();
      let query = supabase
        .from("usage_metrics")
        .select("*")
        .order("date", { ascending: false });

      if (filters) {
        if (filters.userId) {
          query = query.eq("user_id", filters.userId);
        }
        if (filters.userType) {
          query = query.eq("user_type", filters.userType);
        }
        if (filters.dateFrom) {
          query = query.gte("date", filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte("date", filters.dateTo);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching usage metrics:", error);
        return [];
      }

      return (
        data?.map((row) => ({
          userId: row.user_id,
          userType: row.user_type as UsageMetrics["userType"],
          date: row.date,
          actions: row.actions as UsageMetrics["actions"],
        })) || []
      );
    } catch (error) {
      console.error("Error in getUsageMetrics:", error);
      return [];
    }
  }

  /**
   * Resolve a security alert
   */
  async resolveSecurityAlert(alertId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase();
      await supabase
        .from("security_alerts")
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", alertId);
    } catch (error) {
      console.error("Error resolving security alert:", error);
    }
  }
}

// Export singleton instance
export const auditService = AuditService.getInstance();
