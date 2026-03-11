import { User } from './user.model';
import { Pet } from './pet.model';

export interface Client {
  id: number;
  name: string;     
  email: string; 
  phone?: string;
  address?: string;
  user: User;  
  pets?: Pet[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateClientDTO {
  name?: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface UpdateClientDTO {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}