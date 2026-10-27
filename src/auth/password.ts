import * as bcrypt from 'bcryptjs';

/** Costo de bcrypt (2^12 iteraciones): buen equilibrio entre seguridad y tiempo de respuesta. */
const SALT_ROUNDS = 12;

/** Genera el hash bcrypt (con sal aleatoria incluida) de una contraseña. */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Compara una contraseña en claro con su hash bcrypt. */
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
