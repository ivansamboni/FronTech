import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PetsService } from '../../core/services/pets.service';
import { ClientsService } from '../../core/services/clients.service';
import { Pet, CreatePetDTO, UpdatePetDTO, Client } from '../../core/models';

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pets.component.html',
})
export class PetsComponent implements OnInit {
  pets: Pet[] = [];
  filtered: Pet[] = [];
  clients: Client[] = []; // para el select del formulario

  loading = true;
  saving = false;
  showModal = false;
  selectedPet: Pet | null = null;
  error = '';

  form: FormGroup;

  // Tipos de mascota para el select
  petTypes = ['Perro', 'Gato', 'Ave', 'Conejo', 'Reptil', 'Otro'];

  constructor(
    private petsService: PetsService,
    private clientsService: ClientsService,
    private fb: FormBuilder,
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    forkJoin({
      pets: this.petsService.getAll(),
      clients: this.clientsService.getAll(),
    }).subscribe({
      next: ({ pets, clients }) => {
        this.pets = pets;
        this.filtered = pets;
        this.clients = clients;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  // Busca el nombre del dueño dado el client_id de la mascota
  getClientName(clientId: number): string {
    return this.clients.find((c) => c.id === clientId)?.name ?? '—';
  }

  // BÚSQUEDA
  onSearch(term: string): void {
    const t = term.toLowerCase();
    this.filtered = this.pets.filter(
      (p) =>
        p.name.toLowerCase().includes(t) ||
        p.type.toLowerCase().includes(t) ||
        this.getClientName(p.client_id).toLowerCase().includes(t),
    );
  }

  // MODAL
  openCreate(): void {
    this.selectedPet = null;
    this.error = '';
    this.form = this.buildForm();
    this.showModal = true;
  }

  openEdit(pet: Pet): void {
    this.selectedPet = pet;
    this.error = '';
    this.form = this.buildForm(pet);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPet = null;
  }

  // GUARDAR
  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    if (this.selectedPet) {
      // Editar
      const payload: UpdatePetDTO = { id: this.selectedPet.id, ...this.form.value };
      this.petsService.update(this.selectedPet.id, payload).subscribe({
        next: (updated) => {
          this.pets = this.pets.map((p) => (p.id === updated.id ? updated : p));
          this.filtered = this.pets;
          this.saving = false;
          this.closeModal();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al guardar';
          this.saving = false;
        },
      });
    } else {
      // Crear
      const payload: CreatePetDTO = this.form.value;
      this.petsService.create(payload).subscribe({
        next: (created) => {
          this.pets = [...this.pets, created];
          this.filtered = this.pets;
          this.saving = false;
          this.closeModal();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear';
          this.saving = false;
        },
      });
    }
  }

  // ELIMINAR
  onDelete(pet: Pet): void {
    if (!confirm(`¿Eliminar a ${pet.name}?`)) return;
    this.petsService.remove(pet.id).subscribe({
      next: () => {
        this.pets = this.pets.filter((p) => p.id !== pet.id);
        this.filtered = this.pets;
      },
      error: (err) => alert(err.error?.message || 'Error al eliminar'),
    });
  }

  // HELPERS
  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors) return '';
    if (c.errors['required']) return 'Campo obligatorio';
    return '';
  }

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  private buildForm(pet?: Pet): FormGroup {
    return this.fb.group({
      // +() convierte el string del select a número
      client_id: [pet?.client_id ?? '', Validators.required],
      name: [pet?.name ?? '', Validators.required],
      type: [pet?.type ?? 'Perro', Validators.required],
      year_old: [pet?.year_old ?? '', Validators.required],
      observation: [pet?.observation ?? ''],
    });
  }
}
