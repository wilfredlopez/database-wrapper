# database-wrapper

Abstract class that provides API to wrap any database instance/entity. It includes development methods that save a json file and the user is responsible for handling the production methods when the mode is production.

## Install

```
npm i database-wrapper
```

or

```
yarn add database-wrapper
```

## Example Use

#### Extending the class

```ts
//userdb.ts
import { DatabaseWrapper, Connection, WhereType } from "database-wrapper";
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
    this._isProd = process.env.NODE_ENV === "development";
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
```

#### Usage after creation.

```ts
// user.controller.ts
import { Router } from "express";
import { UserDB, UserInput } from "../userdb";

const Controller = Router();

//Find All
Controller.get("/", async (_req, res) => {
  const users = await UserDB.find({});

  res.json(users);
});

//Find by id
Controller.get("/:id", async (req, res) => {
  const id = req.params.id as string;
  const user = await UserDB.findById(id);
  res.json(user);
});

//Login
Controller.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  const user = await UserDB.findOne({
    email: email,
  });

  if (!user) {
    return res.json({
      message: "User Not Found.",
    });
  }
  if (user.password !== password) {
    return res.json({
      message: "Unauthorized",
    });
  }
  return res.json(user);
});

//Register
Controller.post("/", async (req, res) => {
  const data = req.body as UserInput;
  if (!data.email || !data.firstname || !data.password || !data.lastname) {
    res.status(400);
    return res.json({
      message: "Missing one of email, firstname, lastname, password.",
    });
  }
  const user = UserDB.create(data);
  await UserDB.save(user);
  return res.json(user);
});

//Update
Controller.put("/:id", async (req, res) => {
  const data = req.body;
  const updated = await UserDB.updateOne({ id: req.params.id }, data);
  res.json(updated);
});

export const UserController = Controller;
```
