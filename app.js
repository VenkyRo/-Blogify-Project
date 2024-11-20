require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const Blog = require("./models/blog");
const User = require("./models/user");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const {
  checkForAuthenticationCookie
} = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

mongoose.set("strictQuery", false);

// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true, // Avoids deprecation warnings for URL string parsing
    useUnifiedTopology: true // Uses the new Server Discover and Monitoring engine
  })
  .then(() => console.log("MongoDB Connected Succssfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/signup", (req, res) => {
  res.render("signup", { user: req.user || null });
});

app.use((req, res, next) => {
  res.locals.user = req.user || null; // or your user-fetching logic
  next();
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
