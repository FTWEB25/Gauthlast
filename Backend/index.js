const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const UserModel = require("./user.model");
const MongoDBStore = require("connect-mongodb-session")(session);

const app = express();
app.use(cors());
app.use(express.json());

const store = new MongoDBStore({
  uri: "mongodb://localhost:27017/newsession",
  collection: "sessions",
});

app.use(
  session({
    secret: "aStrongSecretHere", 
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: 1000 * 60 * 60 * 24 ,secure:false}, // 1 day
  })
);


app.get("/users",async(req,res)=>{
    console.log(req.session)
    res.send("users")
})

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExist = await UserModel.findOne({ email });
    if (userExist) {
      return res.status(200).json({ msg: "user already exist" });
    }
    const newUser = new UserModel({ name, email, password });
    await newUser.save(); // await the save operation
    res.status(200).json({ msg: "user added", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(200).json({ msg: "please login" });
    }
    if (user.password !== password) {
      return res.status(200).json({ msg: "incorrect password" });
    }
    req.session.username = user.name;
    console.log(req.session)
    res.status(200).json({ msg: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    console.log(req.session.username);
    res.send({msg:"hello"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

app.listen(8080, async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/newsession");
    console.log("connected to the db");
    console.log("server is running at 8080");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
});
