import * as firebase from 'firebase/app';

export interface IDriver {
  name?: string;
  id?: string;
  lat?: number;
  lng?: number;
  lastUpdate?: Date | firebase.firestore.Timestamp;
}
