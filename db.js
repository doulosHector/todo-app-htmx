const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.sqlite"); // Specify the file path for the database

// Create a table if it does not exist and insert data
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS todo (id INTEGER PRIMARY KEY, task TEXT, completed BOOLEAN)"
  );
});

module.exports = db;
