const express = require("express");
const db = require("./db");
const mustacheExpress = require("mustache-express");
const app = express();
const port = 3000;

// Set Mustache as the templating engine
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

app.use(express.static("public"));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// New route to fetch todos from SQLite
app.get("/api/todos", (req, res) => {
  db.all("SELECT * FROM todo", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.render("todos", { todos: rows });
  });
});

// Delete a todo by ID
app.delete("/api/todos/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM todo WHERE id = ?", id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    // After successful deletion, fetch and return the updated list of todos
    db.all("SELECT * FROM todo", [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.render("todos", { todos: rows });
    });
  });
});

// Toggle a todo's completed status by ID
app.put("/api/todos/:id/toggle", (req, res) => {
  const id = req.params.id;
  db.run(
    "UPDATE todo SET completed = NOT completed WHERE id = ?",
    id,
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }
      // After successful update, fetch and return the updated list of todos
      db.all("SELECT * FROM todo", [], (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.render("todos", { todos: rows });
      });
    }
  );
});

// Create a new todo
app.post("/api/todos", (req, res) => {
  const { title } = req.body;
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  db.run(
    "INSERT INTO todo (task, completed) VALUES (?, ?)",
    [title, false],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // After successful insertion, fetch and return the updated list of todos
      db.all("SELECT * FROM todo", [], (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.render("todos", { todos: rows });
      });
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
