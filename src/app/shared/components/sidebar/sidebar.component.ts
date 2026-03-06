import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    },
    {
      path: './users',
      label: 'Usuarios',
      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    },
    {
      path: '/clients',
      label: 'Clients',
      icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    },
    {
      path: '/pets',
      label: 'Mascotas',
      icon: 'M4.5 9.5V5a2.5 2.5 0 0 1 5 0v4.5 M13.5 9.5V5a2.5 2.5 0 0 1 5 0v4.5 M8.5 2.5a2 2 0 0 0-2 2v5h11v-5a2 2 0 0 0-2-2z M7 14.5l-2 6h14l-2-6',
    },
    {
      path: 'qr',
      label: 'QR & Links',
      icon: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M17 14h.01 M14 14h.01 M20 17h.01 M17 20h.01 M20 20h.01 M14 17v3 M17 17v.01',
    },
  ];

  initials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    return user.name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  });

  roleLabels: Record<string, string> = {
    veterinarian: 'Veterinario',
    assistant: 'Asistente',
    admin: 'Amin',
  };

  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout;
  }
}
