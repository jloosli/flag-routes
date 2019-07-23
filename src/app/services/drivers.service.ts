import {Injectable} from '@angular/core';
import * as localForage from 'localforage';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {BehaviorSubject, iif, interval, Observable, of} from 'rxjs';
import * as firebase from 'firebase/app';
import {catchError, distinctUntilChanged, filter, shareReplay, switchMap, tap, throttle} from 'rxjs/operators';
import {IDriver} from '@flags/interfaces/driver';
import NoSleep from 'nosleep.js';

@Injectable({
  providedIn: 'root',
})
export class DriversService {

  private static DRIVER_EXPIRATION = 15 * 60 * 1000; // 15 minutes in milliseconds
  private static readonly POSITION_THROTTLE_TIME = 5000;
  private static GPS_OPTIONS = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000,
  };
  private _broadcast$ = new BehaviorSubject(false);
  private _driverID = new BehaviorSubject<string | null>(null);
  currentPosition$: Observable<Position> = new Observable(observer => {
    const onSuccess: PositionCallback = (pos: Position) => observer.next(pos);
    const onError: PositionErrorCallback = (error) => observer.error(error);
    const options: PositionOptions = DriversService.GPS_OPTIONS;
    const watcher: number = navigator.geolocation.watchPosition(onSuccess, onError, options);
    return () => navigator.geolocation.clearWatch(watcher);
  });
  broadcast$: Observable<boolean> = this._broadcast$.asObservable();

  drivers$: Observable<IDriver[]>;

  driver$: Observable<IDriver>;

  private readonly _hasGeo: boolean;
  private driversCollection: AngularFirestoreCollection<IDriver>;

  private wakeLock$: Observable<boolean> = new Observable((observer) => {
    // @todo: At some point, use the wakelock api (https://developers.google.com/web/updates/2018/12/wakelock)
    const noSleep = new NoSleep();
    noSleep.enable();
    observer.next(true);
    return () => noSleep.disable();
  });


  constructor(private af: AngularFirestore) {
    this.driversCollection = this.af.collection('drivers');
    this.drivers$ = this.driversCollection.valueChanges({idField: 'id'}).pipe(
      tap(drivers => drivers.map(driver => {
        const {lastUpdate} = driver;
        if (lastUpdate && 'toDate' in lastUpdate && (+new Date() - +lastUpdate.toDate()) > DriversService.DRIVER_EXPIRATION) {
          this.af.collection('drivers').doc(driver.id).delete();
        }
      })),
      shareReplay({bufferSize: 1, refCount: true}),
    );
    this.setDriverID();
    this.driver$ = this._driverID.pipe(
      filter(Boolean),
      switchMap(id => this.driversCollection.doc<IDriver>(id).valueChanges() as Observable<IDriver>),
      tap(driver => {
        if (driver && !driver.name) {
          localForage.getItem('driver_name')
            .then(name => name && this.driversCollection.doc(this._driverID.getValue() as string).set({name}, {merge: true}));
        }
      }),
    );
    this.broadcast$
      .pipe(
        distinctUntilChanged(),
        switchMap(broadcast => iif(() => broadcast, this.currentPosition$, of(undefined))),
        catchError(err => {
          this.handleError(err);
          return of(undefined);
        }),
        filter(Boolean),
        throttle(() => interval(DriversService.POSITION_THROTTLE_TIME)),
      ).subscribe(({coords}: Position) => {
      this.updateLocation(coords);
    });

    this.broadcast$.pipe(
      distinctUntilChanged(),
      switchMap(broadcast => iif(() => broadcast, this.wakeLock$, of(undefined))),
    ).subscribe(x => console.log(x));
  }

  async setDriverID(): Promise<void> {
    let id: string | undefined;
    let name = '';
    try {
      id = await localForage.getItem('driver_id') as string;
      name = await localForage.getItem('driver_name');
    } catch (err) {
    }
    if (!id) {
      id = this.af.createId();
      await localForage.setItem('driver_id', id);
    }
    this._driverID.next(id);
  }

  changeBroadcast(broadcast: boolean) {
    this._broadcast$.next(broadcast);
  }

  updateName(name: string = '') {
    return Promise.all([
      localForage.setItem('driver_name', name),
      this.af.collection('drivers').doc(this._driverID.getValue() || '').set({name}, {merge: true}),
    ]);
  }

  updateLocation({latitude, longitude, heading = 0}: Coordinates) {
    const lastUpdate = firebase.firestore.FieldValue.serverTimestamp();
    return this.af.collection('drivers').doc(this._driverID.getValue() || '')
      .set({latitude, longitude, heading, lastUpdate}, {merge: true});
  }

  private handleError(e: PositionError) {
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
    console.log('Sorry, no position available.');
  }
}

