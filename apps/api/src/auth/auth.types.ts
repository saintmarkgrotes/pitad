// What the rest of the app sees as "the signed-in user". Deliberately small:
// never put passwordHash (or anything secret) on it.
export interface AuthUser {
  id: string;
  email: string;
}

// Tells the package our user type, so @CurrentUser() is typed as AuthUser.
declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: AuthUser;
  }
}
