import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app.routing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import 'hammerjs';
import {config} from '../environments/config';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AgmCoreModule} from '@agm/core';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {MaterialDesignModule} from '@flags/modules/material-design.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    MaterialDesignModule,
    AngularFireModule.initializeApp(config.firebaseConfig),
    AngularFirestoreModule,
    AgmCoreModule.forRoot({apiKey: config.google.maps.apiKey}),
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
