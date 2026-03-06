export type UserRole = 'veterinarian' | 'assistant' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  role: UserRole;
  password?: string; //solo al crear
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  role: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserDTO {
  id: number;
  name?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  address?: string;
}
