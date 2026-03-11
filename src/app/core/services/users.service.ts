import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User, CreateUserDTO, UpdateUserDTO, UserRole } from '../models';
import { environment } from '../../../environments/Environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {  
    return this.http.get<User[]>(this.apiUrl).pipe();
  }

  getById(id: number): Observable<User> {  
     return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateUserDTO): Observable<User> {
    return this.http.post<User>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateUserDTO): Observable<User> {  
    return this.http.put<User>(`${this.apiUrl}/${id}`, payload);
  } 

  remove(id: number): Observable<void> {
 
     return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
