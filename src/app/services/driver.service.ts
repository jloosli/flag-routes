import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {IDriver} from '../interfaces/driver';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class DriverService {

  private _watch: any;
  hasGeo: boolean = false;
  drivers$: FirebaseListObservable<Array<IDriver>>;
  driver_key: string = null;
  static readonly POSITION_DEBOUNCE = 5000;
  static readonly MAX_POSITION = 1000 * 60 * 15; // Delete any drivers that haven't updated in over 15 minutes
  errors: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  private gps_options = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000
  };

  constructor(private db: AngularFireDatabase) {
    this.drivers$ = db.list('drivers');
    this.hasGeo = 'geolocation' in navigator;
    this.removeStaleDrivers();
  }

  createDriver(name: string = '') {
    if (!this.hasGeo) return;
    const driver: IDriver = {
      name: name,
      lastUpdate: firebase.database.ServerValue.TIMESTAMP
    };
    this.drivers$.push(driver)
      .then(ref => this.driver_key = ref.key)
      .then(_ => this.startTracking());
  }

  removeDriver() {
    if (this.driver_key) {
      this.drivers$.remove(this.driver_key);
      this.driver_key = null;
      this.stopTracking();
    }
  }

  updateDriver(vals: Object = {}) {
    vals['lastUpdate'] = firebase.database.ServerValue.TIMESTAMP;
    this.drivers$.update(this.driver_key, vals);
  }

  startTracking() {
    this._watch = navigator.geolocation.watchPosition(
      this.success, e => this.error(e), this.gps_options
    );
  }

  public stopTracking() {
    this.hasGeo && navigator.geolocation.clearWatch(this._watch);
  }

  private success = _.throttle((position: Position) => {
    this.errors.next(null);
    this.updateDriver({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
  }, DriverService.POSITION_DEBOUNCE, {leading: true});

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
    this.errors.next(errorMessage);
    console.error(`Error: (${e.code}) ${e.message}`);
    console.log('Sorry, no position available.');
  }

  private removeStaleDrivers() {
    this.drivers$.first().subscribe((drivers: Array<IDriver>) => {
      drivers.forEach(driver => {
        if ((Date.now() - (driver.lastUpdate as number)) > DriverService.MAX_POSITION) {
          console.log('Removing stale driver: ', driver);
          this.drivers$.remove(driver.$key);
        }
      });
    });
  }


}
