import * as firebase from 'firebase/app';

export interface IDriver {
  name?: string;
  id?: string;
  latitude?: number;
  longitude?: number;
  heading?: number;
  lastUpdate?: Date | firebase.firestore.Timestamp;
}
