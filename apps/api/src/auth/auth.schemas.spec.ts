import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth.schemas.js';

describe('registerSchema', () => {
  const valid = {
    email: '  Runner@Example.COM ',
    password: 'correct horse battery',
    displayName: '  Runner ',
  };

  it('normalizes the email and display name', () => {
    expect(registerSchema.parse(valid)).toEqual({
      email: 'runner@example.com',
      password: 'correct horse battery',
      displayName: 'Runner',
    });
  });

  it('rejects a password shorter than 10 characters', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(registerSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects an empty display name', () => {
    expect(registerSchema.safeParse({ ...valid, displayName: '   ' }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts a short password, so existing accounts are never locked out by a new rule', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });
});
