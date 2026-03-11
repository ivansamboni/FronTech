export interface Pet {
  id: number;
  identifier?: string;
  name: string;
  type: string;
  yearOld?: string;       // 👈 camelCase, viene así del backend
  observation?: string;
  clientId: number;       // 👈 camelCase, viene así del backend
  clientName?: string;    // 👈 nombre del dueño incluido en PetDTO
}

export interface CreatePetDTO {
  clientId: number;
  name: string;
  type: string;
  year_old: string;
  observation: string;
}

export interface UpdatePetDTO {
  id: number;
  clientId?: number;
  name?: string;
  type?: string;
  year_old?: string;
  observation?: string;
}