import * as bcrypt from 'bcryptjs';

/** bcrypt cost (2^12 rounds): a good balance between security and response time. */
const SALT_ROUNDS = 12;

/** Creates the bcrypt hash of a password (a random salt is included). */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Compares a plain text password with its bcrypt hash. */
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
