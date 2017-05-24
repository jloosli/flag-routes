import { Component, OnInit } from '@angular/core';
import {ImportExportService} from '../services/import-export.service';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class ImportExportComponent implements OnInit {
  public fileSelected: boolean = false;
  private fileToUpload: File;
  public message: string = '';
  public error: boolean = false;

  constructor(private inOutSvc: ImportExportService) { }

  ngOnInit() {
  }

  fileChange(event) {
    this.fileSelected = event.srcElement.files && !!event.srcElement.files.length;
    if (this.fileSelected) {
      this.fileToUpload = event.srcElement.files[0];
    }
  }

  readFile(form) {
    this.message = '';
    this.error=false;
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
      .then(dataURL=>{
        console.log(dataURL);
        let downloadLink = document.createElement("a");
        downloadLink.href = dataURL;
        //noinspection TypeScriptUnresolvedVariable
        downloadLink.download = 'export.csv';
        downloadLink.style.visibility = "hidden";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      })
      .catch(e=>console.error(e));
  }

}
