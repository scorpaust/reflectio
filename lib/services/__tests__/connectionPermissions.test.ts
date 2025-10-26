import { ConnectionPermissionManager } from "../connectionPermissions";
import { permissionService } from "../permissions";

// Mock the permission service
jest.mock("../permissions", () => ({
  permissionService: {
    checkConnectionPermission: jest.fn(),
    getUserPermissions: jest.fn(),
  },
}));

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: jest.fn(),
  }),
}));

describe("ConnectionPermissionManager", () => {
  let connectionPermissionManager: ConnectionPermissionManager;
  const mockPermissionService = permissionService as jest.Mocked<
    typeof permissionService
  >;

  beforeEach(() => {
    connectionPermissionManager = new ConnectionPermissionManager();
    jest.clearAllMocks();
  });

  describe("canRequestConnection", () => {
    it("should return true for premium users", async () => {
      mockPermissionService.checkConnectionPermission.mockResolvedValue({
        allowed: true,
      });

      const result = await connectionPermissionManager.canRequestConnection(
        "premium-user-id"
      );

      expect(result).toBe(true);
      expect(
        mockPermissionService.checkConnectionPermission
      ).toHaveBeenCalledWith("premium-user-id", "request");
    });

    it("should return false for free users", async () => {
      mockPermissionService.checkConnectionPermission.mockResolvedValue({
        allowed: false,
        reason: "Apenas utilizadores premium podem solicitar conexões",
        upgradePrompt: true,
      });

      const result = await connectionPermissionManager.canRequestConnection(
        "free-user-id"
      );

      expect(result).toBe(false);
      expect(
        mockPermissionService.checkConnectionPermission
      ).toHaveBeenCalledWith("free-user-id", "request");
    });

    it("should return false on error", async () => {
      mockPermissionService.checkConnectionPermission.mockRejectedValue(
        new Error("Database error")
      );

      const result = await connectionPermissionManager.canRequestConnection(
        "user-id"
      );

      expect(result).toBe(false);
    });
  });

  describe("canRespondToConnection", () => {
    it("should return true for all users (free and premium)", async () => {
      mockPermissionService.checkConnectionPermission.mockResolvedValue({
        allowed: true,
      });

      const result = await connectionPermissionManager.canRespondToConnection(
        "any-user-id"
      );

      expect(result).toBe(true);
      expect(
        mockPermissionService.checkConnectionPermission
      ).toHaveBeenCalledWith("any-user-id", "respond");
    });

    it("should return false on error", async () => {
      mockPermissionService.checkConnectionPermission.mockRejectedValue(
        new Error("Database error")
      );

      const result = await connectionPermissionManager.canRespondToConnection(
        "user-id"
      );

      expect(result).toBe(false);
    });
  });

  describe("getConnectionActions", () => {
    it("should return request action for premium users with no existing connection", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: true,
        canCreatePremiumContent: true,
        canCreateReflectionOnPost: jest.fn().mockReturnValue(true),
        canRequestConnection: true,
        requiresMandatoryModeration: false,
      });

      const actions = await connectionPermissionManager.getConnectionActions(
        "premium-user-id",
        "target-user-id",
        "none"
      );

      expect(actions).toHaveLength(1);
      expect(actions[0]).toEqual({
        type: "request",
        label: "Solicitar Conexão",
        enabled: true,
        requiresUpgrade: false,
      });
    });

    it("should return request action with upgrade prompt for free users", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: jest.fn().mockReturnValue(false),
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      const actions = await connectionPermissionManager.getConnectionActions(
        "free-user-id",
        "target-user-id",
        "none"
      );

      expect(actions).toHaveLength(1);
      expect(actions[0]).toEqual({
        type: "request",
        label: "Solicitar Conexão",
        enabled: false,
        requiresUpgrade: true,
      });
    });

    it("should return accept/decline actions for pending connections", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: jest.fn().mockReturnValue(false),
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      connectionPermissionManager.canRespondToConnection = jest
        .fn()
        .mockResolvedValue(true);

      const actions = await connectionPermissionManager.getConnectionActions(
        "user-id",
        "target-user-id",
        "pending"
      );

      expect(actions).toHaveLength(2);
      expect(actions[0]).toEqual({
        type: "accept",
        label: "Aceitar",
        enabled: true,
      });
      expect(actions[1]).toEqual({
        type: "decline",
        label: "Recusar",
        enabled: true,
      });
    });

    it("should return empty array on error", async () => {
      mockPermissionService.getUserPermissions.mockRejectedValue(
        new Error("Database error")
      );

      const actions = await connectionPermissionManager.getConnectionActions(
        "user-id"
      );

      expect(actions).toEqual([]);
    });
  });

  describe("checkConnectionAction", () => {
    it("should allow request action for premium users", async () => {
      mockPermissionService.checkConnectionPermission.mockResolvedValue({
        allowed: true,
      });

      const result = await connectionPermissionManager.checkConnectionAction(
        "premium-user-id",
        "request",
        "target-user-id"
      );

      expect(result).toEqual({
        allowed: true,
        reason: undefined,
        upgradePrompt: undefined,
      });
    });

    it("should deny request action for free users with upgrade prompt", async () => {
      mockPermissionService.checkConnectionPermission.mockResolvedValue({
        allowed: false,
        reason: "Apenas utilizadores premium podem solicitar conexões",
        upgradePrompt: true,
      });

      const result = await connectionPermissionManager.checkConnectionAction(
        "free-user-id",
        "request",
        "target-user-id"
      );

      expect(result).toEqual({
        allowed: false,
        reason: "Apenas utilizadores premium podem solicitar conexões",
        upgradePrompt: true,
      });
    });

    it("should allow accept/decline actions for all users", async () => {
      mockPermissionService.checkConnectionPermission.mockResolvedValue({
        allowed: true,
      });

      const acceptResult =
        await connectionPermissionManager.checkConnectionAction(
          "user-id",
          "accept"
        );
      const declineResult =
        await connectionPermissionManager.checkConnectionAction(
          "user-id",
          "decline"
        );

      expect(acceptResult.allowed).toBe(true);
      expect(declineResult.allowed).toBe(true);
    });

    it("should allow cancel action for all users", async () => {
      const result = await connectionPermissionManager.checkConnectionAction(
        "user-id",
        "cancel"
      );

      expect(result).toEqual({
        allowed: true,
      });
    });

    it("should deny unknown actions", async () => {
      const result = await connectionPermissionManager.checkConnectionAction(
        "user-id",
        "unknown" as any
      );

      expect(result).toEqual({
        allowed: false,
        reason: "Ação não reconhecida",
      });
    });
  });

  describe("getConnectionLimitations", () => {
    it("should return no limitations for premium users", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: true,
        canCreatePremiumContent: true,
        canCreateReflectionOnPost: jest.fn().mockReturnValue(true),
        canRequestConnection: true,
        requiresMandatoryModeration: false,
      });

      const result = await connectionPermissionManager.getConnectionLimitations(
        "premium-user-id"
      );

      expect(result).toEqual({
        canRequest: true,
        canRespond: true,
        limitations: [],
        upgradePrompt: false,
      });
    });

    it("should return limitations for free users", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: jest.fn().mockReturnValue(false),
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      const result = await connectionPermissionManager.getConnectionLimitations(
        "free-user-id"
      );

      expect(result).toEqual({
        canRequest: false,
        canRespond: true,
        limitations: ["Não pode solicitar novas conexões"],
        upgradePrompt: true,
      });
    });

    it("should return error limitations on failure", async () => {
      mockPermissionService.getUserPermissions.mockRejectedValue(
        new Error("Database error")
      );

      const result = await connectionPermissionManager.getConnectionLimitations(
        "user-id"
      );

      expect(result).toEqual({
        canRequest: false,
        canRespond: true,
        limitations: ["Erro ao verificar limitações"],
      });
    });
  });
});
