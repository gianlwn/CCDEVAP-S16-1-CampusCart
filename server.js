require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./backend/db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth',     require('./backend/routes/auth'));
app.use('/api/listings', require('./backend/routes/listings'));
app.use('/api/cart',     require('./backend/routes/cart'));
app.use('/api/users',    require('./backend/routes/users'));

app.use(express.static('frontend'));
app.use('/backend', express.static('backend'));
app.use('/data', express.static('data'));
app.get("/", (req, res) => res.sendFile(__dirname + '/frontend/login-path/login.html'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, 'localhost', () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
