import {Component, Inject} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {switchMap, tap} from 'rxjs/operators';
import {SwUpdate} from '@angular/service-worker';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private snack: MatSnackBar, private updates: SwUpdate, @Inject(DOCUMENT) private document: Document) {
    this.updates.available.pipe(
      tap(availableEvent => console.log(availableEvent)),
      switchMap(() => this.snack.open('Update available.', 'Refresh?').onAction()),
    ).subscribe(() => this.updates.activateUpdate()
      .then(() => this.document.location.reload()),
    );
  }
}
