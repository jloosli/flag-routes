import {Injectable} from '@angular/core';
import {AngularFirestore, DocumentReference} from '@angular/fire/firestore';
import {IHouse} from '@flags/interfaces/house';
import {Delivery} from '@flags/interfaces/delivery';
import {Observable} from 'rxjs/internal/Observable';
import {HouseService} from '@flags/services/house.service';
import {pipe} from 'rxjs/internal-compatibility';
import {map, withLatestFrom} from 'rxjs/operators';
import {collSnapshotWithIDs} from '../shared/rxPipes';

@Injectable({
  providedIn: 'root',
})
export class DeliveriesService {

  constructor(private fs: AngularFirestore) {
  }

  async addDelivery(routeRef: DocumentReference, houseRef: DocumentReference): Promise<DocumentReference> {
    const house: IHouse = await this.fs.doc<IHouse>(houseRef).get().toPromise().then(snap => snap.data() as IHouse);
    const delivery: Partial<Delivery> = {
      name: house.name,
      delivered: false,
      house_ref: houseRef,
    };
    const deliveryDoc = this.fs.doc(routeRef).collection('deliveries').doc(houseRef.id);
    return deliveryDoc.set(delivery, {merge: true}).then(() => deliveryDoc.ref);
  }

  removeDelivery(routeRef: DocumentReference, house_id: string): Promise<void> {
    return this.fs.doc(routeRef).collection('deliveries').doc(house_id).delete();
  }

  async removeAllRouteDeliveries(routeRef: DocumentReference) {
    const querySnap = await this.fs.doc(routeRef).collection('deliveries').get().toPromise();
    const deletionPromises: Promise<any>[] = [];
    querySnap.forEach(docSnap => deletionPromises.push(docSnap.ref.delete()));
    return Promise.all(deletionPromises);
  }

  updateDelivery(deliveryRef: DocumentReference, updates: { order?: number, delivered?: boolean }) {
    return this.fs.doc(deliveryRef).set(updates, {merge: true});
  }

  getRouteDeliveries(routeRef: DocumentReference): Observable<Delivery[]> {
    return this.fs.doc(routeRef).collection<Delivery>('deliveries', ref => ref.orderBy('order')).snapshotChanges()
      .pipe(collSnapshotWithIDs<Delivery>());
  }

  withHouses(housesSvc: HouseService): Observable<Delivery[]> {
    return pipe(
      withLatestFrom(housesSvc.houses$),
      map(([deliveries, houses]: [Delivery[], IHouse[]]) => {
        return deliveries.map(delivery => {
          const house: IHouse | undefined = houses.find(house => house.id === delivery.id);
          if (house) {
            return {...delivery, house: house};
          }
        });
      }),
    );
  }
}
