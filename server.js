require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./backend/db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', require('./backend/routes/auth'));

// More routes will go here, e.g.:
// app.use('/api/listings',   require('./backend/routes/listings'));
// app.use('/api/users',      require('./backend/routes/users'));
// app.use('/api/categories', require('./backend/routes/categories'));

app.get("/", (req, res) => res.json({ message: "CampusCart API is running" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, 'localhost', () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
