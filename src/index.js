const express = require("express");
const path = require("path");
const app = express();
const LogInCollection = require("./mongo");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const templatePath = path.join(__dirname, "../templates");
const publicPath = path.join(__dirname, "../public");

app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.static(publicPath));

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/signup", async (req, res) => {
  try {
    const result = await LogInCollection.findOneAndUpdate(
      { name: req.body.name },
      { $setOnInsert: { name: req.body.name, password: req.body.password } },
      { upsert: true, new: true }
    );

    if (result) {
      res.status(201).render("home", { naming: req.body.name });
    } else {
      res.send("Error creating or retrieving user.");
    }
  } catch (error) {
    res.send("Error in signup: " + error.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const check = await LogInCollection.findOne({ name: req.body.name });

    if (check && check.password === req.body.password) {
      res.status(201).render("home", { naming: `${req.body.name}` });
    } else {
      res.send("Incorrect username or password.");
    }
  } catch (error) {
    res.send("Error in login: " + error.message);
  }
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});
