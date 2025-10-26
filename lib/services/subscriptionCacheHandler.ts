import { permissionService } from "./permissions";

/**
 * Handler para invalidar cache quando status de subscrição muda
 */
export class SubscriptionCacheHandler {
  /**
   * Invalida cache quando utilizador se torna premium
   */
  static onUserUpgradedToPremium(userId: string): void {
    console.log(`Invalidating cache for user ${userId} - upgraded to premium`);
    permissionService.invalidateUserCache(userId);
  }

  /**
   * Invalida cache quando utilizador cancela premium
   */
  static onUserDowngradedFromPremium(userId: string): void {
    console.log(
      `Invalidating cache for user ${userId} - downgraded from premium`
    );
    permissionService.invalidateUserCache(userId);
  }

  /**
   * Invalida cache quando subscrição expira
   */
  static onSubscriptionExpired(userId: string): void {
    console.log(`Invalidating cache for user ${userId} - subscription expired`);
    permissionService.invalidateUserCache(userId);
  }

  /**
   * Invalida cache quando subscrição é renovada
   */
  static onSubscriptionRenewed(userId: string): void {
    console.log(`Invalidating cache for user ${userId} - subscription renewed`);
    permissionService.invalidateUserCache(userId);
  }

  /**
   * Invalida cache para múltiplos utilizadores (útil para operações em lote)
   */
  static onBulkSubscriptionChange(userIds: string[]): void {
    console.log(
      `Invalidating cache for ${userIds.length} users - bulk subscription change`
    );
    permissionService.invalidateMultipleUsersCache(userIds);
  }

  /**
   * Agenda invalidação de cache para quando subscrição expira
   */
  static scheduleExpirationInvalidation(
    userId: string,
    expirationDate: Date
  ): void {
    const now = new Date();
    const timeUntilExpiration = expirationDate.getTime() - now.getTime();

    if (timeUntilExpiration > 0) {
      setTimeout(() => {
        this.onSubscriptionExpired(userId);
      }, timeUntilExpiration);

      console.log(
        `Scheduled cache invalidation for user ${userId} at ${expirationDate.toISOString()}`
      );
    }
  }
}

/**
 * Hook para integrar com Stripe webhooks
 */
export const handleStripeWebhookCacheInvalidation = {
  /**
   * Handler para webhook de subscrição criada
   */
  onSubscriptionCreated: (customerId: string, userId: string) => {
    SubscriptionCacheHandler.onUserUpgradedToPremium(userId);
  },

  /**
   * Handler para webhook de subscrição cancelada
   */
  onSubscriptionCanceled: (customerId: string, userId: string) => {
    SubscriptionCacheHandler.onUserDowngradedFromPremium(userId);
  },

  /**
   * Handler para webhook de subscrição atualizada
   */
  onSubscriptionUpdated: (
    customerId: string,
    userId: string,
    newExpirationDate?: Date
  ) => {
    SubscriptionCacheHandler.onSubscriptionRenewed(userId);

    if (newExpirationDate) {
      SubscriptionCacheHandler.scheduleExpirationInvalidation(
        userId,
        newExpirationDate
      );
    }
  },

  /**
   * Handler para webhook de pagamento falhado
   */
  onPaymentFailed: (customerId: string, userId: string) => {
    // Não invalida imediatamente, mas pode agendar invalidação
    console.log(
      `Payment failed for user ${userId}, monitoring for potential downgrade`
    );
  },
};
