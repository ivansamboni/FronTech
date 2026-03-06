import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="app">
      <!-- Sidebar siempre visible -->
      <app-sidebar />

      <!-- Aquí va el contenido de cada página -->
      <main class="main">
        <router-outlet />
      </main>
    </div>
  `,
})
export class LayoutComponent {}
