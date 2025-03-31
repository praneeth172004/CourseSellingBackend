const express = require("express");
const routes = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//model
const { AdminSchema, AdminCourse } = require("./db");
//middleware
const { JWT_SCECRET, auth } = require("./auth");
//cookie
const cookieParser = require("cookie-parser");

routes.use(express.json());
routes.use(cookieParser());

routes.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ msg: "Enter username or password" });
  }
  const user = await AdminSchema.findOne({ email });
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await AdminSchema.create({
      email: email,
      password: hashedPassword,
    });
    return res.json({ msg: "You Successfully signed up" });
  } else {
    return res.json({ msg: "User already exists" });
  }
});

routes.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ msg: "Enter username or password" });
  }

  const admin = await AdminSchema.findOne({ email });
  if (!admin) {
    return res.json({ msg: "User not found" });
  }

  const passworddata = await bcrypt.compare(password, admin.password);
  if (passworddata) {
    const token = jwt.sign({ id: admin._id.toString() }, JWT_SCECRET);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite:"strict",
      maxAge: 300000,
    });
    return res.json({ token });
  } else {
    return res.json({ msg: "Invalid password" });
  }
});

routes.use(auth);

routes.post("/course", async (req, res) => {
  const { title, description, price, published, imageLink } = req.body;
  if (!title) {
    return res.json({
      msg: "Title is not entered",
    });
  }
  try {
    await AdminCourse.create({
      title,
      description,
      price,
      imageLink,
      published,
      adminid: req.adminid, 
    });
    return res.json({ msg: "You Successfully Created a Course" });
  } catch (error) {
    return res.json({ msg: "Error creating course", error: error.message });
  }
});

routes.get("/courses", async (req, res) => {
  try {
    const data = await AdminCourse.find({ adminid: req.adminid }); 
    res.json({
      data
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error fetching courses",
      error: error.message
    });
  }
});


routes.put("/courses/:courseId", async (req, res) => {  
  const { courseId } = req.params;
  console.log(courseId)
  const { title, description, price, imageLink, published } = req.body;

  if (!courseId) {
    return res.status(400).json({
      msg: "Course ID is required in the URL",
    });
  }

  try {
    const course = await AdminCourse.findOneAndUpdate(
      { _id: courseId, adminid: req.adminid },
      { title, description, price, imageLink, published},
      { new: true, runValidators: true }
    );
    console.log(course)
    if (!course) {
      return res.status(404).json({ msg: "Course not found or you do not have permission to edit this course" });
    }

    return res.json({ msg: "Course successfully updated", course });
  } catch (er) {   // Catching the error correctly
    if (er.code === 11000) {
      return res.status(400).json({ msg: "Course title already exists. Choose a different title." });
    }
    return res.status(500).json({ msg: "Error updating course", error: er.message });
  }
});

module.exports = routes;
