import {Injectable} from '@angular/core';
import {AngularFirestore, DocumentReference} from '@angular/fire/firestore';
import {IHouse} from '@flags/interfaces/house';
import {Delivery} from '@flags/interfaces/delivery';
import {combineLatest, Observable} from 'rxjs';
import {HouseService} from '@flags/services/house.service';
import {map, shareReplay, tap} from 'rxjs/operators';
import {collSnapshotWithIDs} from '../shared/rxPipes';

@Injectable({
  providedIn: 'root',
})
export class DeliveriesService {

  constructor(private fs: AngularFirestore, private housesSvc: HouseService) {
  }

  async addDelivery(routeRef: DocumentReference, houseRef: DocumentReference, order?: number): Promise<DocumentReference> {
    const house: IHouse = await this.fs.doc<IHouse>(houseRef).get().toPromise().then(snap => snap.data() as IHouse);
    const delivery: Partial<Delivery> = {
      name: house.name,
      delivered: false,
      house_ref: houseRef,
    };
    if (order) {
      delivery.order = order;
    }
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

  async toggleAll(routeRef: DocumentReference, deliveryChange: boolean) {
    const deliveriesSnap = await this.fs.doc(routeRef)
      .collection('deliveries', ref => ref.where('delivered', '==', !deliveryChange)).get().toPromise();
    deliveriesSnap.forEach(deliverySnap => deliverySnap.ref.update({delivered: deliveryChange}));
  }

  getRouteDeliveries(routeRef: DocumentReference, options?: { withHouses: boolean }): Observable<Delivery[]> {
    const withHouses = options && options.withHouses;
    const deliveriesObs = this.fs.doc(routeRef).collection<Delivery>('deliveries', ref => ref.orderBy('order'))
      .snapshotChanges().pipe(
        collSnapshotWithIDs<Delivery>(),
        tap(x => console.log(x)),
      );
    let obs: Observable<Delivery[]>;
    if (withHouses) {
      obs = combineLatest([deliveriesObs, this.housesSvc.houses$]).pipe(
        map(([deliveries, houses]: [Delivery[], IHouse[]]) => {
          return deliveries.map(delivery => {
            const house: IHouse | undefined = houses.find(house => house.id === delivery.id);
            if (house) {
              return {...delivery, house: house};
            } else {
              return delivery;
            }
          });
        }),
      );
    } else {
      obs = deliveriesObs;
    }
    return obs.pipe(shareReplay({refCount: true, bufferSize: 1}));
  }

  async reorderDeliveries(routeRef: DocumentReference, prev: number, curr: number) {
    const batch = this.fs.firestore.batch();
    const deliveriesSnap = await this.fs.doc(routeRef)
      .collection('deliveries', ref => ref.where('order', '>=', Math.min(prev, curr))
        .where('order', '<=', Math.max(prev, curr)))
      .get().toPromise();
    console.log(deliveriesSnap.size);
    const change = prev < curr ? -1 : 1;
    deliveriesSnap.forEach(delivery => {
      console.log(delivery.data());
      let {order} = delivery.data();
      if (order === prev) {
        order = curr;
      } else {
        order += change;
      }
      batch.update(delivery.ref, {order: order});
    });
    return batch.commit();
  }

}
