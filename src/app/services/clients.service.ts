import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Client, CreateClientDTO, UpdateClientDTO } from '../models';
import { environment } from '../../environments/Environment';


@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Client[]> {
     return this.http.get<Client[]>(this.apiUrl);
    
  }

  getById(id: number): Observable<Client> {
     return this.http.get<Client>(`${this.apiUrl}/${id}`);
   
  }

  create(payload: CreateClientDTO): Observable<Client> {
     return this.http.post<Client>(this.apiUrl, payload);   
       
  }

  update(id: number, payload: UpdateClientDTO): Observable<Client> {
     return this.http.put<Client>(`${this.apiUrl}/${id}`, payload);
    
    
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
   
  }
}
