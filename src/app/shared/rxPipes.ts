import {pipe} from 'rxjs';
import {map} from 'rxjs/operators';
import {Action, DocumentChangeAction, DocumentSnapshot} from '@angular/fire/firestore';

// @todo: Convert this to handle either DocumentSnapshot or DocumentChangeAction
// const dataWithID = <T>(a) => {
//   const data = a.payload.data() as T;
//   const id = a.payload.id;
//   // @ts-ignore TS2698: Spread types may only be created from object types.
//   return {id, ...data} as T;
// };

const docSnapshotWithID = <T = any>() => pipe(
  map((action: Action<DocumentSnapshot<T>>) => {
    if (!action || !action.payload || !action.payload.exists) {
      return null;
    }
    const data = action.payload.data() as T;
    const id = action.payload.id;
    const ref = action.payload.ref;
    // @ts-ignore TS2698: Spread types may only be created from object types.
    return {id, ref, ...data} as T;
  }),
);

const collSnapshotWithIDs = <T = any>() => pipe(
  map((actions: DocumentChangeAction<T>[]) => {
    return actions.map(a => {
      const data = a.payload.doc.data();
      const id = a.payload.doc.id;
      const ref = a.payload.doc.ref;
      // @ts-ignore TS2698: Spread types may only be created from object types.
      return {id, ref, ...data} as T;
    });
  }),
);

export {docSnapshotWithID, collSnapshotWithIDs};

