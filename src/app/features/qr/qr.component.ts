import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import QRCode from 'qrcode';
import { PetsService } from '../../core/services/pets.service';
import { ClientsService } from '../../core/services/clients.service';
import { Pet, Client } from '../../core/models';

type Mode = 'qr' | 'link';

@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr.component.html',
})
export class QrComponent implements OnInit {
  pets: Pet[] = [];
  filtered: Pet[] = [];
  clients: Client[] = [];

  loading = true;
  generating = false; // true mientras se genera el QR
  copied = false; // true por 2 segundos después de copiar

  selectedPet: Pet | null = null;
  mode: Mode = 'qr';
  qrDataUrl = ''; // imagen del QR en base64

  constructor(
    private petsService: PetsService,
    private clientsService: ClientsService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      pets: this.petsService.getAll(),
      clients: this.clientsService.getAll(),
    }).subscribe({
      next: ({ pets, clients }) => {
        this.pets = pets;
        this.filtered = pets;
        this.clients = clients;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  // BÚSQUEDA
  onSearch(term: string): void {
    const t = term.toLowerCase();
    this.filtered = this.pets.filter(
      (p) =>
        p.name.toLowerCase().includes(t) ||
        p.type.toLowerCase().includes(t) ||
        this.getClientName(p.client_id).toLowerCase().includes(t),
    );
  }

  // SELECCIONAR MASCOTA Y MODO
  select(pet: Pet, mode: Mode): void {
    this.selectedPet = pet;
    this.mode = mode;
    this.qrDataUrl = '';
    this.copied = false;

    if (mode === 'qr') this.generateQR(pet);
  }

  switchMode(mode: Mode): void {
    this.mode = mode;
    this.copied = false;
    if (mode === 'qr' && this.selectedPet && !this.qrDataUrl) {
      this.generateQR(this.selectedPet);
    }
  }

  // GENERAR QR
  private async generateQR(pet: Pet): Promise<void> {
    this.generating = true;
    try {
      this.qrDataUrl = await QRCode.toDataURL(this.getPetUrl(pet), {
        width: 400,
        margin: 2,
        color: { dark: '#2c2318', light: '#fffdf9' },
        errorCorrectionLevel: 'H',
      });
    } catch (e) {
      console.error('Error generando QR:', e);
    } finally {
      this.generating = false;
    }
  }

  // DESCARGAR QR
  downloadQR(): void {
    if (!this.qrDataUrl || !this.selectedPet) return;
    const a = document.createElement('a');
    a.href = this.qrDataUrl;
    a.download = `QR_${this.selectedPet.name}_${this.selectedPet.identifier ?? this.selectedPet.id}.png`;
    a.click();
  }

  // IMPRIMIR QR
  printQR(): void {
    if (!this.qrDataUrl || !this.selectedPet) return;
    const client = this.getClient(this.selectedPet.client_id);
    const win = window.open('', '_blank')!;
    win.document.write(`
      <!DOCTYPE html><html><head>
        <title>QR - ${this.selectedPet.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;600&display=swap');
          body { font-family:'DM Sans',sans-serif; display:flex; justify-content:center; align-items:center; min-height:100vh; margin:0; background:#f5f0eb }
          .card { background:#fffdf9; border-radius:16px; padding:32px; text-align:center; box-shadow:0 4px 24px rgba(44,35,24,.15); max-width:320px }
          .logo { font-family:'DM Serif Display',serif; font-size:20px; color:#2c2318 }
          .logo span { color:#c17f3e; font-style:italic }
          .name { font-family:'DM Serif Display',serif; font-size:26px; margin:16px 0 4px }
          .meta { font-size:13px; color:#7a6a58; margin-bottom:16px }
          img  { border-radius:8px }
          .id  { font-family:monospace; font-size:11px; color:#7a6a58; margin-top:12px }
        </style>
      </head><body>
        <div class="card">
          <div class="logo">Vet<span>Care</span></div>
          <div class="name">${this.selectedPet.name}</div>
          <div class="meta">${this.selectedPet.type} · ${this.selectedPet.year_old} años · ${client?.name ?? ''}</div>
          <img src="${this.qrDataUrl}" width="220"/>
          <div class="id">${this.selectedPet.identifier ?? `ID-${this.selectedPet.id}`}</div>
        </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  }

  // COPIAR ENLACE
  async copyLink(): Promise<void> {
    if (!this.selectedPet) return;
    await navigator.clipboard.writeText(this.getPetUrl(this.selectedPet));
    this.copied = true;
    setTimeout(() => (this.copied = false), 2200);
  }

  // HELPERS
  getPetUrl(pet: Pet): string {
    return `${window.location.origin}/pet/${pet.identifier ?? pet.id}`;
  }

  getClient(clientId: number): Client | undefined {
    return this.clients.find((c) => c.id === clientId);
  }

  getClientName(clientId: number): string {
    return this.getClient(clientId)?.name ?? '—';
  }

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  whatsappUrl(pet: Pet): string {
    const text = encodeURIComponent(`Perfil de ${pet.name}: ${this.getPetUrl(pet)}`);
    return `https://wa.me/?text=${text}`;
  }
}
