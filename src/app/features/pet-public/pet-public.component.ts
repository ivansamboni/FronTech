import { Component, OnInit, signal } from '@angular/core';
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
  pet = signal<Pet | null>(null);
  estado = signal<Estado>('loading');

  constructor(
    private route: ActivatedRoute,
    private petsService: PetsService
  ) {}

  ngOnInit(): void {
    const identifier = this.route.snapshot.paramMap.get('identifier');
    if (!identifier) {
      this.estado.set('not-found');
      return;
    }

    this.petsService.getByIdentifier(identifier).subscribe({
      next: (pet) => {
        this.pet.set(pet);
        this.estado.set('found');
      },
      error: (err) => {
        this.estado.set(err.status === 404 ? 'not-found' : 'error');
      }
    });
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }
}