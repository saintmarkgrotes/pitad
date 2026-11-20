import * as z from 'zod';

// Trim and lowercase BEFORE validating, so "  Runner@Example.COM " and
// "runner@example.com" are the same account.
const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());

export const registerSchema = z.object({
  email: emailSchema,
  // Length matters more than composition rules. The package caps it at 4 KiB.
  password: z.string().min(10).max(128),
  displayName: z.string().trim().min(1).max(50),
});

// No minimum on login: it must not reject accounts that already exist.
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).max(512),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
