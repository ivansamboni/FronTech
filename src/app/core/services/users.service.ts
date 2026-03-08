import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User, CreateUserDTO, UpdateUserDTO, UserRole } from '../models';
import { environment } from '../../../environments/Environment';
import { tap } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    //return of([...mockUsers]);
    return this.http.get<User[]>(this.apiUrl).pipe();
  }

  getById(id: number): Observable<User> {
    //return of(mockUsers.find((u) => u.id === id)!);
     return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateUserDTO): Observable<User> {
    return this.http.post<User>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateUserDTO): Observable<User> {
    //mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, ...payload } : u));
    //return of(mockUsers.find((u) => u.id === id)!);
    return this.http.put<User>(`${this.apiUrl}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
   // mockUsers = mockUsers.filter((u) => u.id !== id);
    //return of(void 0);
     return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
