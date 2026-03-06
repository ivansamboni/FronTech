import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../../core/services';
import { User, CreateUserDTO, UpdateUserDTO, UserRole } from '../../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filtered: User[] = [];
  loading = true;
  saving = false;
  showModal = false;
  selectedUser: User | null = null;
  searchTerm = '';
  error = '';

  form: FormGroup;

  roles: { value: UserRole; label: string }[] = [
    { value: 'veterinarian', label: 'Veterinario' },
    { value: 'assistant', label: 'Asistente' },
    { value: 'admin', label: 'Administrador' },
  ];

  roleBadge: Record<string, string> = {
    veterinarian: 'badge-vet',
    assistant: 'badge-assistant',
    admin: 'badge-admin',
  };

  roleLabel: Record<string, string> = {
    veterinarian: 'Veterinario',
    assistant: 'Asistente',
    admin: 'Admin',
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

  loadUsers(): void {
    this.loading = true;
    this.usersService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.filtered = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    const t = term.toLowerCase();
    this.filtered = this.users.filter(
      (u) =>
        u.name.toLowerCase().includes(t) ||
        u.email.toLowerCase().includes(t) ||
        u.role.toLowerCase().includes(t),
    );
  }

  openCreate(): void {
    this.selectedUser = null;
    this.error = '';
    this.form = this.buildForm();
    this.showModal = true;
  }

  openEdit(user: User): void {
    this.selectedUser = user;
    this.error = '';

    this.form = this.buildForm(user);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    if (this.selectedUser) {
      const payload: UpdateUserDTO = { id: this.selectedUser.id, ...this.form.value };
      this.usersService.update(this.selectedUser.id, payload).subscribe({
        next: (updated) => {
          this.users = this.users.map((u) => (u.id === updated.id ? updated : u));
          this.filtered = this.users;
          this.saving = false;
          this.closeModal();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al guardar';
          this.saving = false;
        },
      });
    } else {
      const payload: CreateUserDTO = this.form.value;
      this.usersService.create(payload).subscribe({
        next: (created) => {
          this.users = [...this.users, created];
          this.filtered = this.users;
          this.saving = false;
          this.closeModal();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear usuario';
          this.saving = false;
        },
      });
    }
  }

  onDelete(user: User): void {
    if (!confirm(`¿Eliminar a ${user.name}?`)) return;

    this.usersService.remove(user.id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== user.id);
        this.filtered = this.users;
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
      role: [user?.role ?? 'veterinarian', Validators.required],
      phone: [user?.phone ?? ''],
      address: [user?.address ?? ''],

      password: ['', user ? [] : [Validators.required, Validators.minLength(6)]],
    });
  }
}
