import {Component, OnInit} from '@angular/core';
import {ImportExportService} from '@flags/services/import-export.service';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss'],
})
export class ImportExportComponent implements OnInit {
  fileSelected = false;
  fileToUpload: File;
  importing = false;

  constructor(private inOutSvc: ImportExportService, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
  }

  fileChange(event: any) {
    this.fileSelected = event.srcElement.files && !!event.srcElement.files.length;
    if (this.fileSelected) {
      this.fileToUpload = event.srcElement.files[0];
    }
  }

  readFile() {
    this.importing = true;
    this.inOutSvc.importFile(this.fileToUpload)
      .then(({routeCount, houseCount}) => {
        this.snackBar.open(`${routeCount} Routes and ${houseCount} Houses imported successfully.`, undefined, {duration: 3000});
      })
      .catch(msg => {
        this.snackBar.open(msg, undefined, {duration: 3000});
      }).finally(() => this.importing = false);
  }

  exportData() {
    this.inOutSvc.exportData()
      .subscribe(csvData => {
        const blob = new Blob([csvData], {type: ImportExportService.CSV_MIME});
        console.log(csvData);
        const current = new Date();
        const y = current.getFullYear();
        const m = current.getMonth();
        const d = current.getDate();
        const h = current.getHours();
        const min = current.getMinutes();
        const filename = `flag_route_export_${y}_${m}_${d}_${h}_${min}.csv`;
        const downloadLink = document.createElement('a');
        if (downloadLink.download !== undefined) {
          const downloadUrl = URL.createObjectURL(blob);
          downloadLink.setAttribute('href', downloadUrl);
          downloadLink.setAttribute('download', filename);
          downloadLink.style.visibility = 'hidden';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      });
  }

}
