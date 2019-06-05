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
  public static CSV_MIME = 'data:text/csv;charset=utf-8';

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
          this.clearAllData()
            .then(() => this.importData(exploded_result))
            .then((importStats) => resolve(importStats))
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

  private async importData(data: Array<Array<string>>): Promise<any> {
    if (data.length <= 1) {
      throw new Error('No data to import');
    }
    const routes = new Map<string, { name: string, routeRefPromise: Promise<DocumentReference>, houseRefs: Promise<DocumentReference>[] }>();
    const accumulatedPromises: Promise<any>[] = [];
    let houseCount = 0;
    data.forEach((row, idx) => {
      if (idx > 0) {
        const [name, street, notes, route] = row;
        const house: IHouse = {
          name: name,
          street: street,
          notes: notes,
        };
        const housePromise = this.houseSvc.saveHouse(house);
        houseCount++;
        if (route) {
          if (!routes.has(route)) {
            routes.set(route, {
              name: route,
              routeRefPromise: this.routeSvc.add(route, routes.size),
              houseRefs: [],
            });
          }
          routes.get(route)!.houseRefs.push(housePromise);
        } else {
          accumulatedPromises.push(housePromise);
        }
      }
    });

    routes.forEach(async (routeObj, name) => {
      const routeRef = await routeObj.routeRefPromise;
      const resolvedHouses: DocumentReference[] = await Promise.all(routeObj.houseRefs);
      resolvedHouses.map((house_ref: DocumentReference) => {
        accumulatedPromises.push(this.deliveriesSvc.addDelivery(routeRef, house_ref));
      });
    });

    await Promise.all(accumulatedPromises);
    return {houseCount: houseCount, routeCount: routes.size};
  }

  private clearAllData(): Promise<any> {
    return this.routeSvc.clearAllRoutes()
      .then(() => this.houseSvc.clearAllHouses());
  }

}
