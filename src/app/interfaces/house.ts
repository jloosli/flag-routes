import {IRoute} from './route';
import {DocumentReference} from '@angular/fire/firestore';

export interface IHouse {
  name: string;
  street: string;
  notes?: string;
  lat?: number;
  lng?: number;
  id?: string;
  save?: any;
  route_ref?: DocumentReference
  route?: IRoute;
}
