import { Component, OnInit, signal, computed } from '@angular/core';
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

  pets = signal<Pet[]>([]);
  filtered = signal<Pet[]>([]);
  clients = signal<Client[]>([]);

  loading = signal(true);
  generating = signal(false);
  copied = signal(false);

  selectedPet = signal<Pet | null>(null);
  mode = signal<Mode>('qr');
  qrDataUrl = signal('');

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
        this.pets.set(pets);
        this.filtered.set(pets);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(term: string): void {
    const t = term.toLowerCase();
    this.filtered.set(
      this.pets().filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          p.type.toLowerCase().includes(t) ||
          this.getClientName(p.clientId).toLowerCase().includes(t),
      )
    );
  }

  select(pet: Pet, mode: Mode): void {
    this.selectedPet.set(pet);
    this.mode.set(mode);
    this.qrDataUrl.set('');
    this.copied.set(false);
    if (mode === 'qr') this.generateQR(pet);
  }

  switchMode(mode: Mode): void {
    this.mode.set(mode);
    this.copied.set(false);
    if (mode === 'qr' && this.selectedPet() && !this.qrDataUrl()) {
      this.generateQR(this.selectedPet()!);
    }
  }

  private async generateQR(pet: Pet): Promise<void> {
    this.generating.set(true);
    try {
      this.qrDataUrl.set(await QRCode.toDataURL(this.getPetUrl(pet), {
        width: 400,
        margin: 2,
        color: { dark: '#2c2318', light: '#fffdf9' },
        errorCorrectionLevel: 'H',
      }));
    } catch (e) {
      console.error('Error generando QR:', e);
    } finally {
      this.generating.set(false);
    }
  }

  downloadQR(): void {
    if (!this.qrDataUrl() || !this.selectedPet()) return;
    const a = document.createElement('a');
    a.href = this.qrDataUrl();
    a.download = `QR_${this.selectedPet()!.name}_${this.selectedPet()!.identifier ?? this.selectedPet()!.id}.png`;
    a.click();
  }

  printQR(): void {
    if (!this.qrDataUrl() || !this.selectedPet()) return;
    const pet = this.selectedPet()!;
    const clientName = this.getClientName(pet.clientId);
    const win = window.open('', '_blank')!;
    win.document.write(`
      <!DOCTYPE html><html><head>
        <title>QR - ${pet.name}</title>
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
          <div class="name">${pet.name}</div>
          <div class="meta">${pet.type} · ${pet.yearOld} años · ${clientName}</div>
          <img src="${this.qrDataUrl()}" width="220"/>
          <div class="id">${pet.identifier ?? `ID-${pet.id}`}</div>
        </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  }

  async copyLink(): Promise<void> {
    if (!this.selectedPet()) return;
    await navigator.clipboard.writeText(this.getPetUrl(this.selectedPet()!));
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2200);
  }

  getPetUrl(pet: Pet): string {
    return `${window.location.origin}/pet/${pet.identifier ?? pet.id}`;
  }

  getClient(clientId: number): Client | undefined {
    return this.clients().find((c) => c.id === clientId);
  }

  getClientName(clientId: number): string {
    return this.getClient(clientId)?.name ?? '—';
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  whatsappUrl(pet: Pet): string {
    const text = encodeURIComponent(`Perfil de ${pet.name}: ${this.getPetUrl(pet)}`);
    return `https://wa.me/?text=${text}`;
  }
}