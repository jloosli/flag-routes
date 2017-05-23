export interface IHouse {
  name: string;
  street: string;
  years?: number[];
  notes?: string;
  lat?: number;
  lng?: number;
  $key?: string;
  save?: any;
}
