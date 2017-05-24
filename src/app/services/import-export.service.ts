import {Injectable} from '@angular/core';
import {HouseService} from './house.service';
import 'rxjs/add/operator/withLatestFrom';
import {IHouse} from '../interfaces/house';
import {IRoute} from '../interfaces/route';
import {RouteService} from './route.service';
import * as _ from 'lodash';

@Injectable()
export class ImportExportService {

  private static FIELDS: Array<string> = ['Name', 'Street', 'Notes', 'Route'];

  constructor(private houseSvc: HouseService, private routeSvc: RouteService) {
  }

  getDatastring(data: string): string {
    const csvContent = 'data:text/csv;charset=utf-8,' + data;
    return encodeURI(csvContent);
  }

  exportData(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.houseSvc.routes$
        .withLatestFrom(this.houseSvc.houses$, this.houseSvc.unassignedHouses$)
        .first()
        .subscribe((items) => {
          let [routes, houses, unassigned] = items;
          const routesToReturn = {};
          routes.forEach(route => {
            routesToReturn[route.name] = route.houses.map(house_key => _.find(houses, house => house.$key === house_key));
          });
          routesToReturn[''] = unassigned;
          const flattened = this.flattenData(routesToReturn);
          const stringified = this.stringify(flattened);
          const dataString = this.getDatastring(stringified);
          resolve(dataString);
        });
    });
  }

  private flattenData(data: Object) {
    let flattened = [];
    flattened.push(ImportExportService.FIELDS);
    for (const key in data) {
      data[key].forEach(house => {
        const tmp = [];
        ImportExportService.FIELDS.slice(0, 3).forEach(field => {
          tmp.push(house[field.toLowerCase()]);
        });
        tmp.push(key);
        flattened.push(tmp);
      });
    }
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
      let reader = new FileReader();
      reader.onload = (() => {
        const result = reader.result;
        let exploded_result: Array<Array<string>> = [];
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
      if (data.length === 1) {
        return reject('No data to import');
      }

      this.clearAllData().then(() => {
        const routePromises = [];
        const routes = {};
        data.forEach((row, idx) => {
          if (idx > 0) {
            let [name, street, notes, route] = row;
            let house: IHouse = {
              name: name,
              street: street,
              notes: notes
            };
            routes[route] = routes[route] || [];
            routes[route].push(this.houseSvc.saveHouse(house));
          }
        });
        for (let name in routes) {
          Promise.all(routes[name]).then(resolvedHouses => {
            if (name) {
              let route: IRoute = {
                name: name,
                houses: [],
                deliveries: {}
              };
              resolvedHouses.forEach((house_key: string) => {
                route.houses.push(house_key);
              });
              routePromises.push(this.routeSvc.save(route));
            }
          });
        }
        Promise.all(routePromises).then(_ => resolve());
      });
    });
  }

  private clearAllData(): Promise<any> {
    return new Promise((resolve, reject) => {
      Promise.all([this.houseSvc.clearHouses(), this.routeSvc.clearRoutes()])
        .then(resolve)
        .catch(reject);
    });
  }

}
