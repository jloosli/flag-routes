import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DriversService} from '@flags/services/drivers.service';
import {debounceTime, filter} from 'rxjs/operators';
import {IDriver} from '@flags/interfaces/driver';

@Component({
  selector: 'jl-broadcast',
  templateUrl: './broadcast.component.html',
  styleUrls: ['./broadcast.component.scss'],
})
export class BroadcastComponent implements OnInit {

  locationForm: FormGroup;

  constructor(private fb: FormBuilder, private driversSvc: DriversService) {
    this.locationForm = this.fb.group({
      broadcast: [false],
      name: [''],
    });
  }

  ngOnInit() {
    this.driversSvc.driver$
      .pipe(filter(driver => driver && !!driver.name))
      .subscribe((driver: IDriver) => {
        this.locationForm.get('name')!.setValue(driver.name);
      });
    this.locationForm.get('broadcast')!.valueChanges.subscribe(broadcast => this.driversSvc.changeBroadcast(broadcast));
    this.locationForm.get('name')!.valueChanges.pipe(
      debounceTime(300),
    ).subscribe(name => this.driversSvc.updateName(name));


  }


}
