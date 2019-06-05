import {Injectable} from '@angular/core';
import {HouseService} from './house.service';

import {IHouse} from '@flags/interfaces/house';
import {RouteService} from './route.service';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import {map, take} from 'rxjs/operators';
import {DocumentReference} from '@angular/fire/firestore';
import {DeliveriesService} from '@flags/services/deliveries.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImportExportService {

  private static FIELDS: Array<string> = ['Name', 'Street', 'Notes', 'Route'];

  static getDatastring(data: string): string {
    const csvContent = 'data:text/csv;charset=utf-8,' + data;
    return encodeURI(csvContent);
  }

  constructor(private houseSvc: HouseService, private routeSvc: RouteService, private deliveriesSvc: DeliveriesService) {
  }

  exportData(): Observable<string> {
    return combineLatest([this.routeSvc.routesWithHouses$, this.houseSvc.houses$]).pipe(
      take(1),
      map(([routes, houses]) => {
        const routesToReturn: any[] = [];
        routes.map(route => {
          if (route.houses) {
            route.houses.map(house => routesToReturn.push({
              name: house.name,
              street: house.street,
              notes: house.notes,
              route: route.name,
            }));
          }
        });
        houses.filter(house => !Boolean(house.route_ref)).map(house => routesToReturn.push({
          name: house.name,
          street: house.street,
          notes: house.notes,
          route: '',
        }));
        const flattened = this.flattenData(routesToReturn);
        return this.stringify(flattened);
      }),
    );
  }

  private flattenData(data: any[]) {
    const flattened = [];
    flattened.push(ImportExportService.FIELDS);
    data.map(house => flattened.push([house.name, house.street, house.notes, house.route || '']));
    return flattened;
  }

  private stringify(data: Array<any>): string {
    let result = '';
    data.forEach(row => {
      if (row.length < ImportExportService.FIELDS.length) {
        for (let i = ImportExportService.FIELDS.length - row.length; i--;) {
          row.push('');
        }
      }
      const cleaned = row.map((item: string) => {
        return (item && item.replace('"', '%22')) || '';
      });
      result += '"' + cleaned.join('","') + '"\n';
    });
    return result;
  }

  importFile(file: File, delimiter: string = ','): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (() => {
        const result: string = reader.result as string;
        const exploded_result: Array<Array<string>> = [];
        if (!result) {
          return reject('Nothing uploaded');
        }
        result.split('\n').forEach(row => {
          if (row.length > 0) {
            exploded_result.push(row.split(delimiter).map(item => {
              return item.trim().replace(/^"(.+)?"$/, '$1').trim();
            }));
          }
        });
        if (this.checkImportedData(exploded_result)) {
          this.importData(exploded_result)
            .then(() => resolve())
            .catch(reject);
        } else {
          reject('File is not formatted properly. Please check the format and upload again.');
        }
      });
      reader.onerror = (event => {
        console.log(event);
        reject('Some unknown error occured.');
      });
      reader.readAsText(file);
    });
  }

  private checkImportedData(data: Array<Array<string>>) {
    return data[0] && data[0].length === ImportExportService.FIELDS.length;
  }

  private importData(data: Array<Array<string>>): Promise<any> {
    return new Promise((resolve, reject) => {
      if (data.length <= 1) {
        return reject('No data to import');
      }

      this.clearAllData().then(() => {
        const routePromises: Promise<any>[] = [];
        const routes: any = {};
        data.forEach((row, idx) => {
          if (idx > 0) {
            const [name, street, notes, route] = row;
            const house: IHouse = {
              name: name,
              street: street,
              notes: notes,
            };
            routes[route] = routes[route] || [];
            routes[route].push(this.houseSvc.saveHouse(house));
          }
        });
        Object.keys(routes).map(async (name) => {
          const routeRef = await this.routeSvc.add(name);
          const resolvedHouses: DocumentReference[] = await Promise.all(routes[name]);
          if (name) {
            resolvedHouses.map((house_ref: DocumentReference) => {
              routePromises.push(this.deliveriesSvc.addDelivery(routeRef, house_ref));
            });
          }
        });

        Promise.all(routePromises).then(_ => resolve());
      });
    });
  }

  private clearAllData(): Promise<any> {
    return Promise.resolve();
    // return new Promise((resolve, reject) => {
    //   Promise.all([this.houseSvc.clearHouses(), this.routeSvc.clearRoutes()])
    //     .then(resolve)
    //     .catch(reject);
    // });
  }

}
