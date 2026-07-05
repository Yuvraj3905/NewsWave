import { SetMetadata } from '@nestjs/common';
import { ManagerRole } from '../managers/manager.entity';

export const ROLES_KEY = 'roles';

/** Restrict a route to the given manager roles. Requires RolesGuard. */
export const Roles = (...roles: ManagerRole[]) => SetMetadata(ROLES_KEY, roles);
