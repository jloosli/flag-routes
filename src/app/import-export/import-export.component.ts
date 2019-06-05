import {Component, OnInit} from '@angular/core';
import {ImportExportService} from '../services/import-export.service';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss'],
})
export class ImportExportComponent implements OnInit {
  public fileSelected = false;
  private fileToUpload: File;
  public message = '';
  public error = false;

  constructor(private inOutSvc: ImportExportService) {
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
    this.message = '';
    this.error = false;
    this.inOutSvc.importFile(this.fileToUpload)
      .then(result => {
        this.message = 'Routes and houses imported successfully.';
      })
      .catch(msg => {
        this.message = msg;
        this.error = true;
      });
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
