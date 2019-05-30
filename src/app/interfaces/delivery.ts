import {DocumentReference} from '@angular/fire/firestore';
import {IHouse} from '@flags/interfaces/house';

export interface Delivery {
  id?: string;
  name: string;
  delivered: boolean;
  order: number;
  house_ref: DocumentReference;
  house?:IHouse;
}
