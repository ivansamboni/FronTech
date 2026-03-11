export interface Pet {
  id: number;
  identifier?: string;
  name: string;
  type: string;
  yearOld?: string;       // 👈 camelCase, viene así del backend
  observation?: string; 
  clientId: number; 
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;   // 👈 nombre del dueño incluido en PetDTO
}

export interface CreatePetDTO {
  clientId: number;
  name: string;
  type: string;
  yearOld: string;
  observation: string;
}

export interface UpdatePetDTO {
  id: number;
  clientId?: number;
  name?: string;
  type?: string;
  yearOld?: string;
  observation?: string;
}