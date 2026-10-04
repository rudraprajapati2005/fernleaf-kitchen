import { SetMetadata } from '@nestjs/common';
import { Permission } from '@fernleaf/domain';

export const PERMS_KEY = 'perms';
export const RequirePerm = (...perms: Permission[]) => SetMetadata(PERMS_KEY, perms);
export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);
