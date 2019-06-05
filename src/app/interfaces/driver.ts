import Timestamp = firebase.firestore.Timestamp;

export interface IDriver {
  name?: string;
  id?: string;
  lat?: number;
  lng?: number;
  lastUpdate?: Date | Timestamp;
}
