import {Injectable} from '@angular/core';
import {SwUpdate, UpdateActivatedEvent, UpdateAvailableEvent} from '@angular/service-worker';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceWorkerService {
  updatesAvailable$: Observable<UpdateAvailableEvent>;
  activated$: Observable<UpdateActivatedEvent>;
  activateUpdate: () => Promise<void>;

  constructor(private updates: SwUpdate) {
    this.updatesAvailable$ = this.updates.available;
    this.activated$ = this.updates.activated;
    this.activateUpdate = this.updates.activateUpdate;
  }
}
