import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ClientsService } from '../../core/services/clients.service';
import { PetsService } from '../../core/services/pets.service';
import { Client, CreateClientDTO, UpdateClientDTO } from '../../core/models';
import { Pet } from '../../core/models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients.component.html',
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  filtered: Client[] = [];
  pets: Pet[] = []; // para contar mascotas por cliente

  loading = true;
  saving = false;
  showModal = false;
  selectedClient: Client | null = null;
  error = '';

  form: FormGroup;

  constructor(
    private clientsService: ClientsService,
    private petsService: PetsService,
    private fb: FormBuilder,
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    // Cargamos clientes y mascotas al mismo tiempo
    forkJoin({
      clients: this.clientsService.getAll(),
      pets: this.petsService.getAll(),
    }).subscribe({
      next: ({ clients, pets }) => {
        this.clients = clients;
        this.filtered = clients;
        this.pets = pets;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  // Cuenta cuántas mascotas tiene un cliente
  petCount(clientId: number): number {
    return this.pets.filter((p) => p.client_id === clientId).length;
  }

  // BÚSQUEDA
  onSearch(term: string): void {
    const t = term.toLowerCase();
    this.filtered = this.clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(t) ||
        c.email.toLowerCase().includes(t) ||
        c.phone?.toLowerCase().includes(t),
    );
  }

  // MODAL
  openCreate(): void {
    this.selectedClient = null;
    this.error = '';
    this.form = this.buildForm();
    this.showModal = true;
  }

  openEdit(client: Client): void {
    this.selectedClient = client;
    this.error = '';
    this.form = this.buildForm(client);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedClient = null;
  }

  // GUARDAR
  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    if (this.selectedClient) {
      // Editar
      const payload: UpdateClientDTO = { id: this.selectedClient.id, ...this.form.value };
      this.clientsService.update(this.selectedClient.id, payload).subscribe({
        next: (updated) => {
          this.clients = this.clients.map((c) => (c.id === updated.id ? updated : c));
          this.filtered = this.clients;
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
      const payload: CreateClientDTO = this.form.value;
      this.clientsService.create(payload).subscribe({
        next: (created) => {
          this.clients = [...this.clients, created];
          this.filtered = this.clients;
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
  onDelete(client: Client): void {
    if (!confirm(`¿Eliminar a ${client.name}?`)) return;
    this.clientsService.remove(client.id).subscribe({
      next: () => {
        this.clients = this.clients.filter((c) => c.id !== client.id);
        this.filtered = this.clients;
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
    if (c.errors['email']) return 'Email inválido';
    if (c.errors['minlength']) return 'Mínimo 6 caracteres';
    return '';
  }

  initials(name?: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  private buildForm(client?: Client): FormGroup {
    return this.fb.group({
      name: [client?.name ?? '', Validators.required],
      email: [client?.email ?? '', [Validators.required, Validators.email]],
      phone: [client?.phone ?? ''],
      address: [client?.address ?? ''],
      // Contraseña solo al crear
      password: ['', client ? [] : [Validators.required, Validators.minLength(6)]],
    });
  }
}
