import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Client, CreateClientDTO, UpdateClientDTO } from '../models';
import { environment } from '../../environments/Environment';

let mockClients: Client[] = [
  { id: 1, name: 'Juan Pérez', email: 'juan@mail.com', phone: '311-000-0001' },
  { id: 2, name: 'María López', email: 'maria@mail.com', phone: '311-000-0002' },
  { id: 3, name: 'Pedro Sánchez', email: 'pedro@mail.com', phone: '311-000-0003' },
];

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Client[]> {
    // return this.http.get<Client[]>(this.apiUrl);
    return of([...mockClients]);
  }

  getById(id: number): Observable<Client> {
    // return this.http.get<Client>(`${this.apiUrl}/${id}`);
    return of(mockClients.find((c) => c.id === id)!);
  }

  create(payload: CreateClientDTO): Observable<Client> {
    // return this.http.post<Client>(this.apiUrl, payload);
    const newClient: Client = { ...payload, id: Date.now() };
    mockClients = [...mockClients, newClient];
    return of(newClient);
  }

  update(id: number, payload: UpdateClientDTO): Observable<Client> {
    // return this.http.put<Client>(`${this.apiUrl}/${id}`, payload);
    mockClients = mockClients.map((c) => (c.id === id ? { ...c, ...payload } : c));
    return of(mockClients.find((c) => c.id === id)!);
  }

  remove(id: number): Observable<void> {
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
    mockClients = mockClients.filter((c) => c.id !== id);
    return of(void 0);
  }
}
