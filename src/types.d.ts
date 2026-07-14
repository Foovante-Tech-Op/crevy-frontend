// src/types.d.ts
import { TRole } from "./types/user.types";

export type TBetterAuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  image?: string;
  // numeric role id from the user_role table
  roleId?: number;
  // role name from the role table (e.g., 'super_admin')
  role?: TRole;
  firstName?: string;
  lastName?: string;

  hasOnboarded?: boolean;
  emailVerified: boolean;
};
