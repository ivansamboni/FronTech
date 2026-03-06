import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { UsersService } from '../../core/services';
import { ClientsService } from '../../core/services';
import { PetsService } from '../../core/services';
import { User } from '../../core/models';
import { Client } from '../../core/models';
import { Pet } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  clients: Client[] = [];
  pets: Pet[] = [];

  loading = true;

  constructor(
    private usersService: UsersService,
    private clientsService: ClientsService,
    private petsService: PetsService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      users: this.usersService.getAll(),
      clients: this.clientsService.getAll(),
      pets: this.petsService.getAll(),
    }).subscribe({
      next: ({ users, clients, pets }) => {
        this.users = users;
        this.clients = clients;
        this.pets = pets;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando datos: ', err);
        this.loading = false;
      },
    });
  }

  getClientName(clientId: number): string {
    return this.clients.find((c) => c.id === clientId)?.name ?? '_';
  }

  get stats() {
    return [
      {
        label: 'Usuarios',
        value: this.users.length,
        icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      },
      {
        label: 'Clientes',
        value: this.clients.length,
        icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      },
      {
        label: 'Mascotas',
        value: this.pets.length,
        icon: 'M4.5 9.5V5a2.5 2.5 0 0 1 5 0v4.5 M13.5 9.5V5a2.5 2.5 0 0 1 5 0v4.5 M8.5 2.5a2 2 0 0 0-2 2v5h11v-5a2 2 0 0 0-2-2z M7 14.5l-2 6h14l-2-6',
      },
    ];
  }
}
