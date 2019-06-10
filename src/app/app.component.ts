import {Component} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {ServiceWorkerService} from '@flags/services/service-worker.service';
import {switchMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private snack: MatSnackBar, private sw: ServiceWorkerService) {
    this.sw.updatesAvailable$.pipe(
      tap(availableEvent => console.log(availableEvent)),
      switchMap(() => this.snack.open('Update available.', 'Refresh?').onAction()),
    ).subscribe(() => {
      this.sw.activateUpdate().then(() => document.location.reload());
    });
  }
}
