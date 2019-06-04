import {IHouse} from '@flags/interfaces/house';
import {FSItem} from '@flags/interfaces/fsitem';

export interface IRoute extends FSItem {
  order?: number;
  lat?: number;
  lng?: number;
  name: string;
  house_count: number;
  houses?: IHouse[];
}
