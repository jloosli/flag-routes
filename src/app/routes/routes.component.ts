import {Component, OnInit} from '@angular/core';
import {IRoute} from '@flags/interfaces/route';
import {HouseService} from '@flags/services/house.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {RouteService} from '@flags/services/route.service';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.scss'],
})
export class RoutesComponent implements OnInit {

  routes$: Observable<Array<IRoute>>;

  constructor(private houseSvc: HouseService, private router: Router, private routesSvc: RouteService) {
  }

  ngOnInit() {
    this.routes$ = this.routesSvc.routes$;
  }

  gotoRoute(id: string) {
    this.router.navigate(['/routes', id]);
  }

}
