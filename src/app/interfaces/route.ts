import {IHouse} from '@flags/interfaces/house';

export interface IRoute {
  id?: string;
  order?: number;
  lat?: number;
  lng?: number;
  name: string;
  house_count: number;
  houses?: IHouse[];
}
