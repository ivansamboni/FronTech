export interface Pet {
  id: number;
  identifier?: string;
  client_id: number;
  name: string;
  type: string;
  year_old: string;
  observation: string;
}

export interface CreatePetDTO {
  client_id: number;
  name: string;
  type: string;
  year_old: string;
  observation: string;
}

export interface UpdatePetDTO {
  id: number;
  client_id?: number;
  name?: string;
  type?: string;
  year_old?: string;
  observation?: string;
}