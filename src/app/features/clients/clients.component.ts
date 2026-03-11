import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ClientsService } from '../../core/services/clients.service';
import { PetsService } from '../../core/services/pets.service';
import { Client, CreateClientDTO, UpdateClientDTO, Pet } from '../../core/models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients.component.html',
})
export class ClientsComponent implements OnInit {
  clients        = signal<Client[]>([]);
  filtered       = signal<Client[]>([]);
  pets           = signal<Pet[]>([]);
  loading        = signal(true);
  saving         = signal(false);
  showModal      = signal(false);
  selectedClient = signal<Client | null>(null);
  error          = signal('');

  form: FormGroup;

  constructor(
    private clientsService: ClientsService,
    private petsService: PetsService,
    private fb: FormBuilder,
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    forkJoin({
      clients: this.clientsService.getAll(),
      pets: this.petsService.getAll(),
    }).subscribe({
      next: ({ clients, pets }) => {
        this.clients.set(clients);
        this.filtered.set([...clients]);
        this.pets.set(pets);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  
  petCount = (clientId: number) =>
    this.pets().filter((p) =>  p.clientId === clientId).length;

  
  onSearch(term: string): void {
    const t = term.toLowerCase();
    this.filtered.set(
      this.clients().filter(
        (c) =>
          c.name?.toLowerCase().includes(t) ||    // 👈 c.name
          c.email?.toLowerCase().includes(t) ||   // 👈 c.email
          c.phone?.toLowerCase().includes(t),
      ),
    );
  }

  
  openCreate(): void {
    this.selectedClient.set(null);
    this.error.set('');
    this.form = this.buildForm();
    this.showModal.set(true);
  }

  openEdit(client: Client): void {
    this.selectedClient.set(client);
    this.error.set('');
    this.form = this.buildForm(client);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedClient.set(null);
  }

  
  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const client = this.selectedClient();

    if (client) {
      const payload: UpdateClientDTO = { id: client.id, ...this.form.value };
      this.clientsService.update(client.id, payload).subscribe({
        next: (updated) => {
          this.clients.update((list) => list.map((c) => (c.id === updated.id ? updated : c)));
          this.filtered.set([...this.clients()]);
          this.saving.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al guardar');
          this.saving.set(false);
        },
      });
    } else {
      const payload: CreateClientDTO = this.form.value;
      this.clientsService.create(payload).subscribe({
        next: (created) => {
          this.clients.update((list) => [...list, created]);
          this.filtered.set([...this.clients()]);
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

  
  onDelete(client: Client): void {
    if (!confirm(`¿Eliminar a ${client.name}?`)) return;  // 👈 client.user.name
    this.clientsService.remove(client.id).subscribe({
      next: () => {
        this.clients.update((list) => list.filter((c) => c.id !== client.id));
        this.filtered.set([...this.clients()]);
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
    if (c.errors['required'])  return 'Campo obligatorio';
    if (c.errors['email'])     return 'Email inválido';
    if (c.errors['minlength']) return 'Mínimo 6 caracteres';
    return '';
  }

  initials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  private buildForm(client?: Client): FormGroup {
    return this.fb.group({
      name:     [client?.name    ?? '', Validators.required],   // 👈 client.name
      email:    [client?.email   ?? '', [Validators.required, Validators.email]], // 👈 client.email
      phone:    [client?.phone   ?? ''],
      address:  [client?.address ?? ''],
      password: ['', client ? [] : [Validators.required, Validators.minLength(6)]],
    });
  }
}