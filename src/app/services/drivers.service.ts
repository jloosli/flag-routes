import {Injectable} from '@angular/core';
import * as localForage from 'localforage';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {IDriver} from '@flags/interfaces/driver';
import {BehaviorSubject, Observable} from 'rxjs';
import * as firebase from 'firebase/app';
import _throttle from 'lodash-es/throttle';
import {filter, switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DriversService {

  static readonly POSITION_DEBOUNCE = 5000;
  private _driverID = new BehaviorSubject<string|null>(null);
  drivers$: Observable<IDriver[]>;

  driver$: Observable<IDriver>;
  private _error$ = new BehaviorSubject<string|null>(null);
  error$ = this._error$.asObservable();

  private gps_options = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000
  };
  private readonly _hasGeo: boolean;
  private _watch: number;
  private driversCollection: AngularFirestoreCollection<IDriver>;

  private success = _throttle((position: Position) => {
    // this.errors.next(null);
    const { coords } = position;
    this.updateLocation(coords.latitude, coords.longitude);
  }, DriversService.POSITION_DEBOUNCE, { leading: true });

  constructor(private af: AngularFirestore) {
    this._hasGeo = 'geolocation' in navigator;
    this.driversCollection = this.af.collection('drivers');
    this.drivers$ = this.driversCollection.valueChanges();
    this.setDriverID();
    this.driver$ = this._driverID.pipe(
      filter(Boolean),
      switchMap(id => this.driversCollection.doc<IDriver>(id).valueChanges() as Observable<IDriver>)
    );
  }



  async setDriverID(): Promise<void> {
    let id: string;
    try {
      id = await localForage.getItem('driver_id') as string;
    } catch (err) {
      id = this.af.createId();
      await localForage.setItem('driver_id', id);
    }

    this._driverID.next(id);
  }

  updateName(name: string = '') {
    if (!this._hasGeo) return;
    return this.af.collection('drivers').doc(this._driverID.getValue() as string).set({ name }, { merge: true });
  }

  updateLocation(lat: number, lng: number) {
    if (!this._hasGeo) return;
    const lastUpdate = firebase.firestore.FieldValue.serverTimestamp();
    return this.af.collection('drivers').doc(this._driverID.getValue() as string).set({ lat, lng, lastUpdate }, { merge: true });
  }

  startTracking() {
    this._watch = navigator.geolocation.watchPosition(
      this.success,
      e => this.error(e),
      this.gps_options
    );
  }

  stopTracking() {
    this._hasGeo && navigator.geolocation.clearWatch(this._watch);
  }

  private error(e: PositionError) {
    let errorMessage;
    switch (e.code) {
      case e.PERMISSION_DENIED:
        errorMessage = 'Can\'t track...you have denied access to tracking';
        break;
      case e.POSITION_UNAVAILABLE:
        errorMessage = 'Sorry...can\'t get position';
        break;
      case e.TIMEOUT:
      default:
        errorMessage = 'Sorry...something went wrong';
    }
    console.error(`Error: (${e.code}) ${e.message}`);
    this._error$.next(e.message);
    console.log('Sorry, no position available.');
  }
}
