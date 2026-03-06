import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User, CreateUserDTO, UpdateUserDTO, UserRole } from '../models';
import { environment } from '../../environments/Environment';

let mockUsers: User[] = [
  {
    id: 1,
    name: 'Dr. Ana García',
    email: 'ana@vet.com',
    role: 'veterinarian' as UserRole,
    phone: '310-000-0001',
  },
  {
    id: 2,
    name: 'Carlos Méndez',
    email: 'carlos@vet.com',
    role: 'assistant' as UserRole,
    phone: '310-000-0002',
  },
  {
    id: 3,
    name: 'Laura Administra',
    email: 'laura@vet.com',
    role: 'admin' as UserRole,
    phone: '310-000-0003',
  },
];

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return of([...mockUsers]);
    // return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return of(mockUsers.find((u) => u.id === id)!);
    // return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateUserDTO): Observable<User> {
    const newUser: User = { ...payload, id: Date.now(), role: payload.role as UserRole };
    mockUsers = [...mockUsers, newUser];
    return of(newUser);
    // return this.http.post<User>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateUserDTO): Observable<User> {
    mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, ...payload } : u));
    return of(mockUsers.find((u) => u.id === id)!);
    // return this.http.put<User>(`${this.apiUrl}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    mockUsers = mockUsers.filter((u) => u.id !== id);
    return of(void 0);
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
