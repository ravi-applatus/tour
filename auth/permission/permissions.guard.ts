import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { PermissionsType } from '../../role/entities/permission.entity';
import { ErrorService } from '../../../error/error.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private error: ErrorService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionsType[]
    >('permissions', [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (user.role.roleMapPermissions.length === 0) {
      this.error.forbidden();
    }

    const hasPermissions = requiredPermissions.some((requiredPermissions) =>
      user.role.roleMapPermissions
        .map((r) => r.permission.type)
        .includes(requiredPermissions),
    );

    if (!hasPermissions) {
      this.error.forbidden();
    }

    return true;
  }
}
