import { UserRole } from './user.model';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}
