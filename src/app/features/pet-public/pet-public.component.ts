import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PetsService } from '../../core/services/pets.service';
import { Pet } from '../../core/models';

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
  estado: Estado = 'loading';

  constructor(
    private route: ActivatedRoute,
    private petsService: PetsService,
    // 👈 eliminamos ClientsService, no lo necesitamos
  ) {}

  ngOnInit(): void {
    const identifier = this.route.snapshot.paramMap.get('identifier');
    if (!identifier) {
      this.estado = 'not-found';
      return;
    }

    this.petsService.getByIdentifier(identifier).subscribe({
      next: (pet) => {
        this.pet = pet;
        this.estado = 'found'; // 👈 directo, sin segunda llamada al backend
      },
      error: (err) => {
        this.estado = err.status === 404 ? 'not-found' : 'error';
      },
    });
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }
}