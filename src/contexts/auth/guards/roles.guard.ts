import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { UserRole } from "@/contexts/users/domain/user.entity";

import { RequestWithUser } from "../decorators/current-tenant.decorator";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      UserRole[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (requiredRoles === undefined) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    if (!user?.role) return false;

    // Optional: Auto-allow SUPER_ADMIN if we want, currently requiring explicit checks
    return requiredRoles.includes(user.role as UserRole);
  }
}
