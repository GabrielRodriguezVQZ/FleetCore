import { Role } from './enums.js';

/** Logged-in user that the JwtAuthGuard adds to `request.user`. */
export class AuthUser {
  id: number;
  email: string;
  role: Role;
}
