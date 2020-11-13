import { Connection, getId, WithId } from ".";

export type WhereType<T extends {}> = {
  [K in keyof T]?: T[K];
};

export abstract class DatabaseWrapper<T extends WithId> {
  protected abstract _isProd: boolean;
  protected abstract _connection: Connection<T>;
  //Abstract Methods
  abstract create(...args: any[]): T;
  abstract find(where: WhereType<T>): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract findOne(where: WhereType<T>): Promise<T | null>;
  abstract remove(where: WhereType<T>): Promise<this>;
  abstract deleteOne(where: WhereType<T>): Promise<this>;
  abstract update(data: WhereType<T>, values: Partial<T>): Promise<T[]>;
  abstract updateOne(
    where: WhereType<T>,
    values: Partial<T>
  ): Promise<T | null>;
  abstract save(data: T): Promise<this>;

  //UTILITIES
  protected _getId = getId;
  protected _hasId(data: any) {
    return "_id" in data || "id" in data;
  }

  //DEVELOPMENT METHODS
  protected _findByIdDev(id: string): Promise<T | null> {
    return new Promise<T | null>((res) => {
      const data = this._connection.retrive();
      const obj = data[id];
      if (obj) {
        res(obj);
      }
      res(null);
    });
  }
  protected _findDev(where: WhereType<T>): Promise<T[]> {
    return new Promise((res) => {
      const data = this._connection.retrive();
      if (Object.keys(where).length === 0) {
        res(Object.values(data));
        return;
      }
      const result: T[] = [];
      if (this._hasId(where)) {
        const id = this._getId(where);
        result.push(data[id]);
      } else {
        for (let obj of Object.values(data)) {
          for (let val of Object.values(obj)) {
            let allMatch = true;
            for (let key in where) {
              const prop = where[key as keyof typeof where] as any;
              if (prop !== val) {
                allMatch = false;
              }
            }
            if (allMatch) {
              result.push(obj);
            }
          }
        }
      }
      res(result);
    });
  }
  protected async _findOneDev(where: WhereType<T>): Promise<T | null> {
    return new Promise<T | null>((res) => {
      const data = this._connection.retrive();
      if (this._hasId(where)) {
        const id = this._getId(where);
        const user = data[id];
        res(user);
      } else {
        for (let obj of Object.values(data)) {
          if (isSomeMatchFunction(obj, where)) {
            res(obj);
            break;
          }
        }
        res(null);
      }
    });
  }
  protected async _saveDev(obj: T): Promise<this> {
    return new Promise((res) => {
      const data = this._connection.retrive();
      const id = this._getId(obj);
      data[id] = obj;
      this._connection.save(data);
      res(this);
    });
  }
  protected async _updateDev(
    where: WhereType<T>,
    values: Partial<T>
  ): Promise<T[]> {
    const data = this._connection.retrive();
    let users = await this.find(where);
    const output: T[] = [];
    for (let u of users) {
      output.push(Object.assign(u, values));
      const id = this._getId(u);
      data[id] = u;
    }
    this._connection.save(data);
    return output;
  }
  protected async _updateOneDev(
    where: WhereType<T>,
    values: Partial<T>
  ): Promise<T | null> {
    const data = this._connection.retrive();
    let user = await this.findOne(where);
    if (user) {
      user = Object.assign(user, values);
      const id = this._getId(user);
      data[id] = user;
      this.save(user);
      return user;
    }
    return null;
  }
  protected async _removeDev(where: WhereType<T>): Promise<this> {
    const toRemove = await this.find(where);
    const data = this._connection.retrive();
    const ids = toRemove.map((o) => this._getId(o));
    for (let id of ids) {
      delete data[id];
    }
    this._connection.save(data);
    return this;
  }
  protected async _deleteOneDev(where: WhereType<T>): Promise<this> {
    const value = await this.findOne(where);
    if (value) {
      this._connection.remove(value);
    }

    return this;
  }
}

// function isAllMatchFunction<T>(obj: T, where: WhereType<T>) {
//   let allMatch = true
//   for (let val of Object.values(obj)) {
//     for (let key in where) {
//       const prop = where[key as keyof typeof where]
//       if (prop !== val) {
//         allMatch = false
//         break
//       }
//     }
//   }
//   return allMatch
// }
function isSomeMatchFunction<T>(obj: T, where: WhereType<T>) {
  let someMatch = false;
  for (let val of Object.values(obj)) {
    for (let key in where) {
      const prop = where[key as keyof typeof where];
      if (prop === val) {
        someMatch = true;
        break;
      }
    }
  }
  return someMatch;
}

export default DatabaseWrapper;
