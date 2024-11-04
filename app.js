require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookiePaser = require("cookie-parser");

const Blog = require("./models/blog");
// In your other file where you want to use the User model
const User = require('./models/user');


const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;
//"mongodb://localhost:27017/blogify"
mongoose
  .connect(process.env.MONGO_URL,)
  .then((e) => console.log("MongoDB Connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookiePaser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.get("/nav", async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).send("User not authenticated");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    console.log("User object:", user); // Log the user object to check its properties

    res.render("nav", { user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Server error");
  }
});



app.get("/about", (req, res) => {
  res.render("about");
});


app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
