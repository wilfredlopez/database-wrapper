import { UserDB, UserInput } from "./userdb";

describe("DatabaseWrapper", () => {
  afterAll(async () => {
    await UserDB.remove({});
  });
  it("Instance can create and not save", async () => {
    const data: UserInput = {
      email: "test@test.com",
      firstname: "Wil",
      lastname: "lopez",
      password: "password",
    };

    const user = UserDB.create(data);
    expect(user.id).not.toBeUndefined();
    expect(user.email).toBe(data.email);
    const saved = await UserDB.findById(user.id);
    expect(saved).toBe(null);
  });
  it("Can be saved in json file", async () => {
    const data: UserInput = {
      email: "test@test.com",
      firstname: "Wil",
      lastname: "lopez",
      password: "password",
    };

    const user = UserDB.create(data);
    await UserDB.save(user);
    const saved = await UserDB.findById(user.id)!;
    if (saved) {
      expect(saved.id).toBe(user.id);
    } else {
      expect(saved).not.toBeNull();
    }
  });
  it("Find", async () => {
    const saved = await UserDB.find({});
    expect(Array.isArray(saved)).toBeTruthy();
    expect(saved[0].email).toBeDefined();
  });
  it("updateOne", async () => {
    const saved = await UserDB.find({});
    const user0 = saved[0];
    const updated = await UserDB.updateOne(
      { id: user0.id },
      {
        name: "new name",
      }
    );
    await UserDB.save(updated!);
    expect(updated!.name).toBe("new name");
  });
  it("Find", async () => {
    const saved = await UserDB.find({});
    expect(Array.isArray(saved)).toBeTruthy();
    expect(saved[0].email).toBeDefined();
  });
  it("updateOne", async () => {
    const saved = await UserDB.find({});
    const user0 = saved[0];
    await UserDB.deleteOne({ id: user0.id });
    const deleted = await UserDB.findById(user0.id);
    expect(deleted).toBe(null);
  });
});
