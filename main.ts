import express, { Request, Response } from "express";
import Database from "better-sqlite3";

const app = express();
app.use(express.json());

export function createDb(filename: string = "./users.db"): Database.Database {
  const db = new Database(filename);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    )
  `);
  return db;
}

const db = createDb();

app.get("/users", (_req: Request, res: Response) => {
  const users = db.prepare("SELECT id, name, email FROM users").all();
  res.json(users);
});

app.post("/users", (req: Request, res: Response) => {
  const { name, email } = req.body;

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    res.status(400).json({ detail: "Email already registered" });
    return;
  }

  const result = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)").run(name, email);
  const user = { id: result.lastInsertRowid, name, email };
  res.status(201).json(user);
});

export { app, db };

if (require.main === module) {
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
