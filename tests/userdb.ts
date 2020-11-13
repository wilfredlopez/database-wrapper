//userdb.ts
// import { DatabaseWrapper, Connection, WhereType } from "database-wrapper";
import { DatabaseWrapper, Connection, WhereType } from "../src/";
import { v4 } from "uuid";
import path from "path";

export interface UserInput {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

//This could be the Regular Database object. for example a mongoosee Model or a micro-orm entity.
class User implements UserInput {
  id: string;
  name: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  constructor({ firstname, email, lastname, password }: UserInput) {
    this.id = v4();
    this.name = `${firstname} ${lastname}`;
    this.email = email;
    this.firstname = firstname;
    this.lastname = lastname;
    this.password = password;
  }
}

//Extend the abstract Class and add production Methods.
class UserDbWrapper extends DatabaseWrapper<User> {
  protected _connection: Connection<User>;
  protected _isProd: boolean;
  constructor() {
    super();
    const userPath = path.join(__dirname, "users.json");
    this._connection = new Connection<User>(userPath);
    this._isProd = false;
  }

  create(userInput: UserInput) {
    return new User(userInput);
  }

  async find(
    where: WhereType<Omit<User, "surveys">>,
    _populate?: string[]
  ): Promise<User[]> {
    if (!this._isProd) {
      return this._findDev(where);
    } else {
      //...PROD CODE
    }
    throw new Error("Method not implemented.");
  }

  findById(id: string): Promise<User | null> {
    if (!this._isProd) {
      return this._findByIdDev(id);
    }
    throw new Error("Method not implemented.");
  }

  findOne(where: WhereType<Omit<User, "surveys">>): Promise<User | null> {
    if (!this._isProd) {
      return this._findOneDev(where);
    }
    throw new Error("Method not implemented.");
  }
  remove(where: WhereType<User>): Promise<this> {
    if (!this._isProd) {
      return this._removeDev(where);
    }
    throw new Error("Method not implemented.");
  }
  deleteOne(where: WhereType<User>): Promise<this> {
    if (!this._isProd) {
      return this._deleteOneDev(where);
    }
    throw new Error("Method not implemented.");
  }
  update(where: WhereType<User>, values: Partial<User>): Promise<User[]> {
    if (!this._isProd) {
      return this._updateDev(where, values);
    }
    throw new Error("Method not implemented.");
  }
  async updateOne(
    where: WhereType<User>,
    values: Partial<User>
  ): Promise<User | null> {
    if (!this._isProd) {
      return this._updateOneDev(where, values);
    }

    throw new Error("Method Not Implemented");
  }

  async save(user: User): Promise<this> {
    if (!this._isProd) {
      return this._saveDev(user);
    }
    throw new Error("Method Not Implemented");
  }
}

//Export an instance of the wrapper
export const UserDB = new UserDbWrapper();
