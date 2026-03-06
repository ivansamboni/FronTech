import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Pet, CreatePetDTO, UpdatePetDTO } from '../models';
import { environment } from '../../environments/Environment';

let mockPets: Pet[] = [
  {
    id: 1,
    client_id: 1,
    name: 'Luna',
    type: 'Perro',
    year_old: '3',
    observation: 'Alérgica al pollo',
    identifier: 'LUNA-001',
  },
  {
    id: 2,
    client_id: 1,
    name: 'Simba',
    type: 'Gato',
    year_old: '5',
    observation: '',
    identifier: 'SIMBA-001',
  },
  {
    id: 3,
    client_id: 2,
    name: 'Pico',
    type: 'Ave',
    year_old: '2',
    observation: 'Dieta especial',
    identifier: 'PICO-001',
  },
];

@Injectable({ providedIn: 'root' })
export class PetsService {
  private readonly apiUrl = `${environment.apiUrl}/pets`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Pet[]> {
    // return this.http.get<Pet[]>(this.apiUrl);
    return of([...mockPets]);
  }

  getByClient(clientId: number): Observable<Pet[]> {
    // return this.http.get<Pet[]>(`${this.apiUrl}?client_id=${clientId}`);
    return of(mockPets.filter((p) => p.client_id === clientId));
  }

  getByIdentifier(identifier: string): Observable<Pet> {
    // return this.http.get<Pet>(`${this.apiUrl}/by-identifier/${identifier}`);
    const pet = mockPets.find((p) => p.identifier === identifier || String(p.id) === identifier);
    if (!pet) throw new Error('Not found');
    return of(pet);
  }

  getById(id: number): Observable<Pet> {
    // return this.http.get<Pet>(`${this.apiUrl}/${id}`);
    return of(mockPets.find((p) => p.id === id)!);
  }

  create(payload: CreatePetDTO): Observable<Pet> {
    // return this.http.post<Pet>(this.apiUrl, payload);
    const newPet: Pet = {
      ...payload,
      id: Date.now(),
      identifier: `PET-${Date.now()}`,
      observation: payload.observation ?? '',
    };
    mockPets = [...mockPets, newPet];
    return of(newPet);
  }

  update(id: number, payload: UpdatePetDTO): Observable<Pet> {
    // return this.http.put<Pet>(`${this.apiUrl}/${id}`, payload);
    mockPets = mockPets.map((p) => (p.id === id ? { ...p, ...payload } : p));
    return of(mockPets.find((p) => p.id === id)!);
  }

  remove(id: number): Observable<void> {
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
    mockPets = mockPets.filter((p) => p.id !== id);
    return of(void 0);
  }
}
