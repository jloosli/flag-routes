import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {debounceTime, filter, take} from 'rxjs/operators';
import {IDriver} from '@flags/interfaces/driver';
import {Observable} from 'rxjs';
import {DriversService} from '@flags/services/drivers.service';

@Component({
  selector: 'jl-broadcast',
  templateUrl: './broadcast.component.html',
  styleUrls: ['./broadcast.component.scss'],
})
export class BroadcastComponent implements OnInit {

  driverNameInput = new FormControl('');
  broadcast$: Observable<boolean>;

  constructor(private driversSvc: DriversService) {
    this.broadcast$ = this.driversSvc.broadcast$;
  }

  ngOnInit() {
    this.driversSvc.driver$
      .pipe(filter(driver => driver && !!driver.name))
      .subscribe((driver: IDriver) => {
        this.driverNameInput.setValue(driver.name);
      });
    this.driverNameInput.valueChanges.pipe(
      debounceTime(300),
    ).subscribe(name => this.driversSvc.updateName(name));
  }

  toggleBroadcast() {
    this.broadcast$.pipe(take(1)).subscribe(broadcast => this.driversSvc.changeBroadcast(!broadcast));

  }

}
