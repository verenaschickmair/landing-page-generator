import { Injectable, inject } from '@angular/core';

import {
  Database,
  DatabaseReference,
  objectVal,
  ref,
  set,
  update,
} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { PromiseResult } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor() {}

  private database = inject(Database);

  public async setData<T>(path: string, id: string, element: T): Promise<void> {
    return PromiseResult.from(
      set(this.databaseReference(path, id), element),
      'setData'
    );
  }

  public async updateData<T>(
    path: string,
    id: string,
    element: Partial<T>
  ): Promise<void> {
    return PromiseResult.from(
      update(this.databaseReference(path, id), element),
      'updateData'
    );
  }

  public async deleteData(path: string, id: string): Promise<void> {
    return PromiseResult.from(
      set(this.databaseReference(path, id), null),
      'deleteData'
    );
  }

  public readData<T>(path: string, id: string): Observable<T> {
    return objectVal<T>(this.databaseReference(path, id));
  }

  private databaseReference(path: string, id: string): DatabaseReference {
    return ref(this.database, `local/${path}/${id}`);
  }
}
