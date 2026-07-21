export interface IAuthService {
  register(): Promise<void>;
  login(): Promise<void>;
  logout(): Promise<void>;
  getSession(): Promise<void>;
}

export class AuthService implements IAuthService{
  async register(): Promise<void> {
    // Better Auth registration
    throw new Error("Method Not implemented");
  }

  async login(): Promise<void> {
    // Better Auth login
    throw new Error("Method Not implemented");
  }

  async logout(): Promise<void> {
    // Better Auth logout
    throw new Error("Method Not implemented");
  }

  async getSession(): Promise<void> {
    // Current session
    throw new Error("Method Not implemented");
  }
}

export const authService: IAuthService = new AuthService();
