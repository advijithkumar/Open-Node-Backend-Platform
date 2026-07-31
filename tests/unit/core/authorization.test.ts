import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthorizationService } from "../../../apps/api/src/core/auth/authorization.service.js";
import { requireAuth, requireRole, requirePermission } from "../../../apps/api/src/core/auth/auth.middleware.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";
import { AppError } from "../../../apps/api/src/core/errors/app-error.js";

// Mock Better Auth getSession
vi.mock("../../../apps/api/src/core/auth/better-auth.js", () => {
  return {
    auth: {
      api: {
        getSession: vi.fn(),
      },
    },
  };
});

import { auth } from "../../../apps/api/src/core/auth/better-auth.js";

describe("Authorization Layer Unit Tests", () => {
  let roleService: any;
  let cache: any;
  let authService: AuthorizationService;

  beforeEach(() => {
    vi.clearAllMocks();

    roleService = {
      repository: {
        findBySlug: vi.fn(),
      },
      getRolePermissions: vi.fn(),
    };

    cache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    // Clean container and register mocks
    const definitions = (container as any).definitions;
    definitions.delete(CORE_SERVICES.CACHE);
    definitions.delete("roleService");
    definitions.delete("authorizationService");
    const singletons = (container as any).singletons;
    singletons.delete(CORE_SERVICES.CACHE);
    singletons.delete("roleService");
    singletons.delete("authorizationService");

    container.registerSingleton(CORE_SERVICES.CACHE, () => cache);
    container.registerSingleton("roleService", () => roleService);
    
    authService = new AuthorizationService();
    container.registerSingleton("authorizationService", () => authService);
  });

  describe("AuthorizationService Evaluation", () => {
    it("should resolve roles in hierarchy", async () => {
      expect(await authService.hasRole("super-admin", "admin")).toBe(true);
      expect(await authService.hasRole("admin", "manager")).toBe(true);
      expect(await authService.hasRole("manager", "employee")).toBe(true);
      expect(await authService.hasRole("employee", "guest")).toBe(true);
      
      expect(await authService.hasRole("guest", "admin")).toBe(false);
      expect(await authService.hasRole("employee", "manager")).toBe(false);
    });

    it("should return super-admin permission wildcards", async () => {
      const hasAccess = await authService.hasPermission("user-1", "super-admin", "any.permission");
      expect(hasAccess).toBe(true);
      expect(roleService.repository.findBySlug).not.toHaveBeenCalled();
    });

    it("should resolve permissions from Repository and cache them", async () => {
      const mockRole = { id: "role-1", slug: "employee" };
      const mockPerms = [{ slug: "users.read" }];
      
      roleService.repository.findBySlug.mockResolvedValue(mockRole);
      roleService.getRolePermissions.mockResolvedValue(mockPerms);

      const hasAccess1 = await authService.hasPermission("user-1", "employee", "users.read");
      expect(hasAccess1).toBe(true);
      expect(cache.set).toHaveBeenCalledWith("user:user-1:permissions", ["users.read"], 300);

      // Verify diagnostics
      const diags = authService.getDiagnostics();
      expect(diags.cacheStatus.misses).toBe(1);
    });

    it("should resolve permissions from Cache directly on hit", async () => {
      cache.get.mockResolvedValue(["users.read"]);

      const hasAccess = await authService.hasPermission("user-1", "employee", "users.read");
      expect(hasAccess).toBe(true);
      expect(roleService.repository.findBySlug).not.toHaveBeenCalled();

      const diags = authService.getDiagnostics();
      expect(diags.cacheStatus.hits).toBe(1);
    });
  });

  describe("Guards Middleware", () => {
    it("should permit authenticated requireAuth", async () => {
      const req: any = { headers: {} };
      const res: any = {};
      const next = vi.fn();

      (auth.api.getSession as any).mockResolvedValue({
        user: { id: "user-1", role: "employee" },
        session: { id: "sess-1" },
      });

      const middleware = requireAuth();
      await middleware(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe("user-1");
      expect(next).toHaveBeenCalledWith();
    });

    it("should fail unauthenticated requireAuth with 401", async () => {
      const req: any = { headers: {} };
      const res: any = {};
      const next = vi.fn();

      (auth.api.getSession as any).mockResolvedValue(null);

      const middleware = requireAuth();
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it("should permit requireRole on successful match", async () => {
      const req: any = { user: { id: "user-1", role: "admin" } };
      const res: any = {};
      const next = vi.fn();

      const middleware = requireRole("manager"); // manager is inherited by admin
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it("should fail requireRole on mismatch with 403", async () => {
      const req: any = { user: { id: "user-1", role: "guest" } };
      const res: any = {};
      const next = vi.fn();

      const middleware = requireRole("admin");
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(403);
    });

    it("should permit requirePermission on successful match", async () => {
      const req: any = { user: { id: "user-1", role: "employee" } };
      const res: any = {};
      const next = vi.fn();

      cache.get.mockResolvedValue(["users.read"]);

      const middleware = requirePermission("users.read");
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});
