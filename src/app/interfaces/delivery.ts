import {DocumentReference} from '@angular/fire/firestore';
import {IHouse} from '@flags/interfaces/house';
import {FSItem} from '@flags/interfaces/fsitem';

export interface Delivery extends FSItem {
  name: string;
  delivered: boolean;
  order: number;
  house_ref: DocumentReference;
  house?: IHouse;
}
