import { container } from "../container/container.js";
import { CORE_SERVICES } from "../container/service.constants.js";
import type { ICacheService } from "../cache/cache.interface.js";

export class AuthorizationService {
  private cacheHits = 0;
  private cacheMisses = 0;
  private registeredGuards: string[] = [];
  private protectedRouteCount = 0;

  constructor() {}

  private getCache(): ICacheService | undefined {
    try {
      if (container.has(CORE_SERVICES.CACHE)) {
        return container.resolve<ICacheService>(CORE_SERVICES.CACHE);
      }
    } catch {
      // Fallback
    }
    return undefined;
  }

  private getRoleService(): any {
    try {
      if (container.has("roleService")) {
        return container.resolve<any>("roleService");
      }
    } catch {
      // Fallback
    }
    return undefined;
  }

  registerGuard(guardName: string) {
    if (!this.registeredGuards.includes(guardName)) {
      this.registeredGuards.push(guardName);
    }
  }

  incrementProtectedRouteCount() {
    this.protectedRouteCount++;
  }

  async getEffectivePermissions(userId: string, userRole: string): Promise<Set<string>> {
    const cache = this.getCache();
    const cacheKey = `user:${userId}:permissions`;

    if (cache) {
      try {
        const cached = await cache.get<string[]>(cacheKey);
        if (cached) {
          this.cacheHits++;
          return new Set<string>(cached);
        }
      } catch {
        // Fallback
      }
    }

    this.cacheMisses++;
    const roleService = this.getRoleService();
    if (!roleService) {
      return new Set<string>();
    }

    const permissionsSet = new Set<string>();

    try {
      const roleRecord = await roleService.repository.findBySlug(userRole);
      if (roleRecord) {
        const perms = await roleService.getRolePermissions(roleRecord.id);
        for (const p of perms) {
          permissionsSet.add(p.slug);
        }
      }
    } catch {
      // Fallback
    }

    if (cache) {
      try {
        await cache.set(cacheKey, Array.from(permissionsSet), 300); // 5 min TTL
      } catch {
        // Fallback
      }
    }

    return permissionsSet;
  }

  async hasPermission(userId: string, userRole: string, requiredPermission: string): Promise<boolean> {
    if (userRole === "super-admin" || userRole === "admin") {
      return true;
    }
    const userPermissions = await this.getEffectivePermissions(userId, userRole);
    return userPermissions.has(requiredPermission);
  }

  async hasRole(userRole: string, requiredRole: string): Promise<boolean> {
    if (userRole === "super-admin") {
      return true;
    }

    const roleHierarchy: Record<string, string[]> = {
      "super-admin": ["admin", "manager", "employee", "guest"],
      admin: ["manager", "employee", "guest"],
      manager: ["employee", "guest"],
      employee: ["guest"],
      guest: [],
    };

    if (userRole === requiredRole) {
      return true;
    }

    const inherited = roleHierarchy[userRole] || [];
    return inherited.includes(requiredRole);
  }

  getDiagnostics() {
    const total = this.cacheHits + this.cacheMisses;
    return {
      service: "AuthorizationService",
      status: "active",
      registeredGuards: this.registeredGuards,
      protectedRouteCount: this.protectedRouteCount,
      cacheStatus: {
        hits: this.cacheHits,
        misses: this.cacheMisses,
        ratio: total > 0 ? (this.cacheHits / total).toFixed(2) : "0.00",
      },
    };
  }
}
export default AuthorizationService;
