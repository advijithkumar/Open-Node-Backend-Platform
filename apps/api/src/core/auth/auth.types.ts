export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
}
