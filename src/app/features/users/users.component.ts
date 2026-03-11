import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../../core/services';
import { User, CreateUserDTO, UpdateUserDTO, UserRole } from '../../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {

  // ── State con Signals
  users = signal<User[]>([]);
  filtered = signal<User[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  selectedUser = signal<User | null>(null);
  searchTerm = signal('');
  error = signal('');

  form: FormGroup;

  roles: { value: UserRole; label: string }[] = [
    { value: 'CLIENTE', label: 'cliente' },
    { value: 'ASISTENTE', label: 'Asistente' },
    { value: 'ADMINISTRADOR', label: 'Administrador' },
  ];

  roleBadge: Record<string, string> = {
    CLIENTE: 'badge-vet',
    ASISTENTE: 'badge-assistant',
    ADMINISTRADOR: 'badge-admin',
  };

  roleLabel: Record<string, string> = {
    CLIENTE: 'Cliente',
    ASISTENTE: 'Asistente',
    ADMINISTRADOR: 'Administrador',
  };

  constructor(
    private usersService: UsersService,
    private fb: FormBuilder,
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading.set(true);
    try {
      const users = await firstValueFrom(this.usersService.getAll());
      this.users.set(users);
      this.filtered.set([...users]);
    } catch (err: any) {
      console.error('❌ loadUsers error:', err.status, err.error);
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    const t = term.toLowerCase();
    this.filtered.set(
      this.users().filter(
        (u) =>
          u.name.toLowerCase().includes(t) ||
          u.email.toLowerCase().includes(t) ||
          u.role.toLowerCase().includes(t),
      ),
    );
  }

  openCreate(): void {
    this.selectedUser.set(null);
    this.error.set('');
    this.form = this.buildForm();
    this.showModal.set(true);
  }

  openEdit(user: User): void {
    this.selectedUser.set(user);
    this.error.set('');
    this.form = this.buildForm(user);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedUser.set(null);
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      if (this.selectedUser()) {
        const { password, ...formData } = this.form.value;
        const payload: UpdateUserDTO = { id: this.selectedUser()!.id, ...formData };
        await firstValueFrom(this.usersService.update(this.selectedUser()!.id, payload));
      } else {
        const payload: CreateUserDTO = this.form.value;
        await firstValueFrom(this.usersService.create(payload));
      }
      await this.loadUsers(); // recarga la lista tras guardar
      this.closeModal();
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al guardar');
    } finally {
      this.saving.set(false);
    }
  }

  async onDelete(user: User): Promise<void> {
    if (!confirm(`¿Eliminar a ${user.name}?`)) return;

    try {
      await firstValueFrom(this.usersService.remove(user.id));
      await this.loadUsers();
    } catch (err: any) {
      alert(err.error?.message || 'Error al eliminar');
    }
  }

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

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  private buildForm(user?: User): FormGroup {
    return this.fb.group({
      name: [user?.name ?? '', Validators.required],
      email: [user?.email ?? '', [Validators.required, Validators.email]],
      role: [user?.role ?? 'CLIENTE', Validators.required],
      phone: [user?.phone ?? ''],
      address: [user?.address ?? ''],
      password: ['', user ? [] : [Validators.required, Validators.minLength(6)]],
    });
  }
}