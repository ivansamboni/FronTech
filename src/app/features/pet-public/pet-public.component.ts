import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PetsService } from '../../core/services/pets.service';
import { ClientsService } from '../../core/services/clients.service';
import { Pet, Client } from '../../core/models';

type Estado = 'loading' | 'found' | 'not-found' | 'error';

@Component({
  selector: 'app-pet-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet-public.component.html',
  styleUrl: './pet-public.component.css',
})
export class PetPublicComponent implements OnInit {
  pet: Pet | null = null;
  client: Client | null = null;
  estado: Estado = 'loading';

  constructor(
    private route: ActivatedRoute,
    private petsService: PetsService,
    private clientsService: ClientsService,
  ) {}

  ngOnInit(): void {
    // Leemos el :identifier de la URL
    const identifier = this.route.snapshot.paramMap.get('identifier');
    if (!identifier) {
      this.estado = 'not-found';
      return;
    }

    // Buscamos la mascota por su identificador
    // En producción: GET /pets/by-identifier/:identifier
    this.petsService.getByIdentifier(identifier).subscribe({
      next: (pet) => {
        this.pet = pet;
        // Ahora buscamos el dueño
        this.clientsService.getById(pet.client_id).subscribe({
          next: (client) => {
            this.client = client;
            this.estado = 'found';
          },
          error: () => {
            this.estado = 'found';
          }, // mostramos la mascota igual
        });
      },
      error: (err) => {
        this.estado = err.status === 404 ? 'not-found' : 'error';
      },
    });
  }

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }
}
