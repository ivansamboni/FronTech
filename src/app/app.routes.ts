import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'registerpet',
    loadComponent: () => import('./features/register-pet/register-pet').then((m) => m.RegisterPet),
  },
  {
    path: 'pet/:identifier',
    loadComponent: () =>
      import('./features/pet-public/pet-public.component').then((m) => m.PetPublicComponent),
  },

  {
    path: 'client-portal',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/client-portal/client-portal.component').then(
        (m) => m.ClientPortalComponent,
      ),
  },

  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/clients/clients.component').then((m) => m.ClientsComponent),
      },
      {
        path: 'pets',
        loadComponent: () => import('./features/pets/pets.component').then((m) => m.PetsComponent),
      },
      {
        path: 'qr',
        loadComponent: () => import('./features/qr/qr.component').then((m) => m.QrComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
