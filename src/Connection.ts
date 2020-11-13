import fs from "fs";

export interface WithMongoId {
  _id: string;
}
export interface WithNormalId {
  id: string;
}

export type WithId = WithMongoId | WithNormalId;

export type DataWithId<T extends {}> = T & WithId;
export type DataInterface<T> = Record<string, T>;

function hasMongoId(data: any): data is WithMongoId {
  if ("_id" in data) {
    return true;
  } else {
    return false;
  }
}

function hasNormalId(data: any): data is WithNormalId {
  if ("id" in data) {
    return true;
  } else {
    return false;
  }
}

export function getId(data: any): string {
  if (hasNormalId(data)) {
    return data.id;
  } else if (hasMongoId(data)) {
    return data._id;
  }
  throw new Error(`No Id Found in object ${data}`);
}

export class Connection<D extends WithId, T = DataInterface<D>> {
  /**
   *
   * @param fileUrl JSON FILE URL.
   */
  constructor(public fileUrl: string) {
    if (!fileUrl.endsWith(".json")) {
      throw new Error("File URL for FakeBb most end with .json");
    }
  }
  public retrive() {
    const data = fs.readFileSync(this.fileUrl, {
      encoding: "utf-8",
      flag: "a+",
    });
    if (data) {
      return JSON.parse(data) as T;
    }
    return {} as T;
  }
  update(obj: DataWithId<D>) {
    const data = this.retrive() as any;
    const id = getId(obj);
    data[id] = obj;
    this.save(data);
  }
  remove(obj: DataWithId<D>) {
    const data = this.retrive() as any;
    const id = getId(obj);
    delete data[id];
    this.save(data);
  }
  public save(obj: T) {
    const data = JSON.stringify(obj);
    fs.writeFileSync(this.fileUrl, data);
    return this;
  }
}
