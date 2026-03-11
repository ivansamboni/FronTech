import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService }    from '../../core/services/auth.service';
import { PetsService }    from '../../core/services/pets.service';
import { Pet, CreatePetDTO, UpdatePetDTO } from '../../core/models';

type Vista = 'mascotas' | 'perfil';

@Component({
  selector: 'app-client-portal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-portal.component.html',
})
export class ClientPortalComponent implements OnInit {

  pets        = signal<Pet[]>([]);
  loading     = signal(true);
  saving      = signal(false);
  showModal   = signal(false);
  selectedPet = signal<Pet | null>(null);
  error       = signal('');
  vista       = signal<Vista>('mascotas');

  form: FormGroup;

  petTypes = ['Perro', 'Gato', 'Ave', 'Conejo', 'Reptil', 'Otro'];

  constructor(
    public  authService: AuthService,
    private petsService: PetsService,
    private fb: FormBuilder,
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.petsService.getByClient(user.id).subscribe({
      next: (pets) => { this.pets.set(pets); this.loading.set(false); },
      error: ()    => { this.loading.set(false); },
    });
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
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving.set(true);
    this.error.set('');

    const user = this.authService.currentUser();
    const pet  = this.selectedPet();

    if (pet) {
      // EDITAR
      const payload: UpdatePetDTO = { id: pet.id, ...this.form.value };
      this.petsService.update(pet.id, payload).subscribe({
        next: (updated) => {
          this.pets.update(list => list.map(p => p.id === updated.id ? updated : p));
          this.saving.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al guardar');
          this.saving.set(false);
        },
      });
    } else {
      // CREAR — genera identifier automáticamente
      const nombre     = this.form.value.name as string;
      const random     = Math.random().toString(36).substring(2, 8).toUpperCase();
      const identifier = `${nombre.toUpperCase().replace(/\s+/g, '-')}-${random}`;

      const payload: CreatePetDTO = {
        ...this.form.value,
        clientId: user!.id,
        identifier,
      };

      this.petsService.create(payload).subscribe({
        next: (created) => {
          this.pets.update(list => [...list, created]);
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

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors) return '';
    if (c.errors['required'])  return 'Campo obligatorio';
    if (c.errors['minlength']) return 'Mínimo 6 caracteres';
    return '';
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }

  private buildForm(pet?: Pet): FormGroup {
    return this.fb.group({
      name:        [pet?.name        ?? '', Validators.required],
      type:        [pet?.type        ?? 'Perro', Validators.required],
      yearOld:     [pet?.yearOld     ?? '', Validators.required],
      observation: [pet?.observation ?? ''],
    });
  }
}