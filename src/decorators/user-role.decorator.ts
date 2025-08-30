import { SetMetadata } from '@nestjs/common';
import { UserRoles } from 'src/enums/roles-enum';

export const USER_ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoles[]) =>
  SetMetadata(USER_ROLES_KEY, roles);
