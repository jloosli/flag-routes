import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {IDriver} from '../interfaces/driver';
import * as firebase from 'firebase';

@Injectable()
export class DriverService {

  private _watch: any;
  hasGeo: boolean = false;
  drivers$: FirebaseListObservable<Array<IDriver>>;
  driver_key: string = null;

  private gps_options = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000
  };

  constructor(private db: AngularFireDatabase) {
    this.drivers$ = db.list('drivers');
    this.hasGeo = 'geolocation' in navigator;
  }

  createDriver(name: string = '') {
    if(!this.hasGeo) return;
    const driver: IDriver = {
      name: name,
      lastUpdate: firebase.database.ServerValue.TIMESTAMP
    };
    this.drivers$.push(driver)
      .then(ref => this.driver_key = ref.key)
      .then(_=>this.startTracking());
  }

  removeDriver() {
    if (this.driver_key) {
      this.drivers$.remove(this.driver_key);
      this.driver_key = null;
      this.stopTracking();
    }
  }

  updateDriver(vals: Object) {
    vals['lastUpdate'] = firebase.database.ServerValue.TIMESTAMP;
    this.drivers$.update(this.driver_key, vals);
  }

  startTracking() {
    this._watch = navigator.geolocation.watchPosition((p) => this.success(p), this.error, this.gps_options);
  }

  public stopTracking() {
    this.hasGeo && navigator.geolocation.clearWatch(this._watch);
  }

  private success(position) {
    this.updateDriver({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
  }

  private error() {
    console.log('Sorry, no position available.');
  }


}
