import { SetMetadata } from "@nestjs/common";

import { UserRole } from "@/contexts/users/domain/user.entity"; // make sure to export enum UserRole from user.entity.ts

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
