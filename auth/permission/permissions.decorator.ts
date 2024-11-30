import { SetMetadata } from '@nestjs/common';
import { PermissionsType } from '../../role/entities/permission.entity';

export const Permissions = (...permissions: PermissionsType[]) =>
  SetMetadata('permissions', permissions);
