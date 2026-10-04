import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission, Permission } from '@fernleaf/domain';
import { PERMS_KEY } from './decorators';
import { JwtUser } from './jwt-user';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(PERMS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;
    const user = context.switchToHttp().getRequest().user as JwtUser | undefined;
    if (!user) throw new ForbiddenException('Not authenticated');
    const ok = required.every((p) => hasPermission(user.role, p));
    if (!ok) throw new ForbiddenException('You do not have permission to do that');
    return true;
  }
}
