import { Component, OnInit, signal } from '@angular/core';
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
  pets = signal<Pet[]>([]);
  filtered = signal<Pet[]>([]);
  clients = signal<Client[]>([]);

  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  selectedPet = signal<Pet | null>(null);
  error = signal('');

  form: FormGroup;
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
        this.pets.set(pets);
        this.filtered.set(pets);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getClientName(clientId: number): string {
    return this.clients().find((c) => c.id === clientId)?.name ?? '—';
  }

  onSearch(term: string): void {
    const t = term.toLowerCase();
    this.filtered.set(
      this.pets().filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          p.type.toLowerCase().includes(t) ||
          this.getClientName(p.clientId).toLowerCase().includes(t),
      ),
    );
  }

  openCreate(): void {
    this.selectedPet.set(null);
    this.error.set('');
    this.form = this.buildForm();
    this.showModal.set(true);
  }

  openEdit(pet: Pet): void {
    this.selectedPet.set(pet);
    this.error.set('');
    this.form = this.buildForm(pet);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedPet.set(null);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    if (this.selectedPet()) {
      const payload: UpdatePetDTO = { id: this.selectedPet()!.id, ...this.form.value };
      this.petsService.update(this.selectedPet()!.id, payload).subscribe({
        next: (updated) => {
          this.pets.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
          this.filtered.set(this.pets());
          this.saving.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al guardar');
          this.saving.set(false);
        },
      });
    } else {
      const identifier = this.form.value.identifier?.trim()
        ? this.form.value.identifier.trim()
        : `${(this.form.value.name as string).toUpperCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const payload: CreatePetDTO = { ...this.form.value, identifier };
      this.petsService.create(payload).subscribe({
        next: (created) => {
          this.pets.update((list) => [...list, created]);
          this.filtered.set(this.pets());
          this.saving.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al crear');
          this.saving.set(false);
        },
      });
    }
  }

  onDelete(pet: Pet): void {
    if (!confirm(`¿Eliminar a ${pet.name}?`)) return;
    this.petsService.remove(pet.id).subscribe({
      next: () => {
        this.pets.update((list) => list.filter((p) => p.id !== pet.id));
        this.filtered.set(this.pets());
      },
      error: (err) => alert(err.error?.message || 'Error al eliminar'),
    });
  }

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
      clientId: [pet?.clientId ?? '', Validators.required],
      name: [pet?.name ?? '', Validators.required],
      type: [pet?.type ?? 'Perro', Validators.required],
      yearOld: [pet?.yearOld ?? '', Validators.required],
      observation: [pet?.observation ?? ''],
      identifier: [pet?.identifier ?? ''],
    });
  }
}
