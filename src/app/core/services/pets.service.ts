import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Pet, CreatePetDTO, UpdatePetDTO } from '../models';
import { environment } from '../../../environments/Environment';


@Injectable({ providedIn: 'root' })
export class PetsService {
  private readonly apiUrl = `${environment.apiUrl}/pets`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Pet[]> {
   return this.http.get<Pet[]>(this.apiUrl);
    //return of([...mockPets]);
  }

  getByClient(clientId: number): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.apiUrl}?client_id=${clientId}`);
    //return of(mockPets.filter((p) => p.client_id === clientId));
  }

  getByIdentifier(identifier: string): Observable<Pet> {
    return this.http.get<Pet>(`${this.apiUrl}/by-identifier/${identifier}`);
  }

  getById(id: number): Observable<Pet> {
    return this.http.get<Pet>(`${this.apiUrl}/${id}`);
    //return of(mockPets.find((p) => p.id === id)!);
  }

  create(payload: CreatePetDTO): Observable<Pet> {
     return this.http.post<Pet>(this.apiUrl, payload);
    
  }

  update(id: number, payload: UpdatePetDTO): Observable<Pet> {
   return this.http.put<Pet>(`${this.apiUrl}/${id}`, payload);
    
  }

  remove(id: number): Observable<void> {
   return this.http.delete<void>(`${this.apiUrl}/${id}`);
    
  }
}
