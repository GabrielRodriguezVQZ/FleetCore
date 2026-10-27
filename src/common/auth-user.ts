import { Role } from './enums.js';

/** Usuario autenticado que el JwtAuthGuard adjunta a `request.user`. */
export class AuthUser {
  id: number;
  email: string;
  role: Role;
}
