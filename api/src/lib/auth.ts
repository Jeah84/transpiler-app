import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, env.jwtSecret) as { userId: string };
}

export function signEmailVerifyToken(userId: string): string {
  return jwt.sign({ userId }, env.emailVerifySecret, { expiresIn: '24h' });
}

export function verifyEmailToken(token: string): { userId: string } {
  return jwt.verify(token, env.emailVerifySecret) as { userId: string };
}

export function generateVerifyToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
