import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DriversService} from '@flags/services/drivers.service';
import {take} from 'rxjs/operators';
import {combineLatest} from 'rxjs';

@Component({
  selector: 'jl-broadcast',
  templateUrl: './broadcast.component.html',
  styleUrls: ['./broadcast.component.scss'],
})
export class BroadcastComponent implements OnInit {

  locationForm: FormGroup;

  constructor(private fb: FormBuilder, private driversSvc: DriversService) {
  }

  ngOnInit() {
    combineLatest([this.driversSvc.driver$, this.driversSvc.broadcast$])
      .pipe(take(1))
      .subscribe(([driver, broadcast]) => {
        this.locationForm = this.fb.group({
          broadcast: [broadcast],
          name: [driver && driver.name || ''],
        });
        this.locationForm.get('broadcast')!.valueChanges.subscribe(broadcast => this.driversSvc.changeBroadcast(broadcast));
        this.locationForm.get('name')!.valueChanges.subscribe(name => this.driversSvc.updateName(name));
      });


  }


}
