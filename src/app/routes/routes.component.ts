import {Component, OnInit} from '@angular/core';
import {IRoute} from '../interfaces/route';
import {IHouse} from '../interfaces/house';
import {HouseService} from '../services/house.service';
import {Observable} from 'rxjs/Observable';
import {Router} from '@angular/router';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.scss']
})
export class RoutesComponent implements OnInit {

  routes: Observable<Array<IRoute>> = Observable.of([]);

  constructor(private houseSvc: HouseService, private router: Router) {
  }

  ngOnInit() {
    this.routes = this.houseSvc.routes$
      .map(routes => routes.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1));
  }

  gotoRoute(key) {
    this.router.navigate(['/routes', key]);
  }

}
