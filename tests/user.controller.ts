// user.controller.ts
import { Router } from "express";
import { UserDB, UserInput } from "./userdb";

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
