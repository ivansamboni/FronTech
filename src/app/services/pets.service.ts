import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pet, CreatePetDTO, UpdatePetDTO } from '../models';
import { environment } from '../../environments/Environment';

@Injectable({ providedIn: 'root' })
export class PetsService {
  private readonly base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Pet[]> {
    return this.http.get<Pet[]>(this.base);
  }

  getByClient(clientId: number): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.base}/client/${clientId}`);
  }

  getByIdentifier(identifier: string): Observable<Pet> {
    return this.http.get<Pet>(`${this.base}pets/by-identifier/${identifier}`);
  }

  getById(id: number): Observable<Pet> {
    return this.http.get<Pet>(`${this.base}/${id}`);
  }

  create(payload: CreatePetDTO): Observable<Pet> {
    return this.http.post<Pet>(this.base, payload);
  }

  update(id: number, payload: UpdatePetDTO): Observable<Pet> {
    return this.http.put<Pet>(`${this.base}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}