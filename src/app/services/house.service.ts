import {Injectable} from '@angular/core';
import {IHouse} from '@flags/interfaces/house';
import {Observable} from 'rxjs';
import _get from 'lodash-es/get';

import {AngularFirestore, AngularFirestoreCollection, DocumentReference} from '@angular/fire/firestore';
import {map, shareReplay} from 'rxjs/operators';
import {collSnapshotWithIDs} from '../shared/rxPipes';

@Injectable({
  providedIn: 'root',
})
export class HouseService {

  private housesCollection: AngularFirestoreCollection<IHouse>;
  houses$: Observable<IHouse[]>;
  housesWithRoutes$: Observable<IHouse[]>;
  unassignedHouses$: Observable<IHouse[]>;

  constructor(private fs: AngularFirestore) {
    this.housesCollection = this.fs.collection<IHouse>('houses');
    this.houses$ = this.housesCollection.snapshotChanges().pipe(
      collSnapshotWithIDs<IHouse>(),
      map(houses => houses.sort((a, b) => a.name.localeCompare(b.name))),
      shareReplay({refCount: true, bufferSize: 1}),
    );
    this.housesWithRoutes$ = this.houses$.pipe(
      map(houses => houses.filter(house => Boolean(house.route_ref))),
    );
    this.unassignedHouses$ = this.houses$.pipe(
      map(houses => houses.filter(house => !Boolean(house.route_ref))),
    );
  }

  housesByRoute(route_ref: DocumentReference): Observable<Array<IHouse>> {
    return this.houses$.pipe(
      map(houses => houses.filter(house => house.route_ref === route_ref)),
    );
  }

  saveHouse(house: Partial<IHouse>): Promise<DocumentReference> {
    const toSave: IHouse = {
      name: _get(house, ['name'], ''),
      street: _get(house, ['street'], ''),
      notes: _get(house, ['notes'], ''),
    };
    if (house.id) {
      const houseDoc = this.housesCollection.doc(house.id);
      return houseDoc.set(toSave, {merge: true}).then(() => houseDoc.ref);
    } else {
      return this.housesCollection.add(toSave);
    }
  }

  removeHouse(id: string) {
    return this.housesCollection.doc(id).delete();
  }
}
