const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserSchema, AdminCourse, PurchasedCourses } = require("./db");
const cookieParser = require("cookie-parser");
const {  auth, JWT_SCECRET } = require("./users_middleware");

const router = express.Router(); 
router.use(express.json());
router.use(cookieParser());

/* 🔐 SIGNUP Route */
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Enter username or password" });
  }

  const user = await UserSchema.findOne({ email });
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserSchema.create({
      email,
      password: hashedPassword,
    });
    return res.status(201).json({ msg: "You successfully signed up" });
  } else {
    return res.status(400).json({ msg: "User already exists" });
  }
});

/* 🔐 SIGNIN Route */
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Enter username or password" });
  }

  const user = await UserSchema.findOne({ email });
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  const passworddata = await bcrypt.compare(password, user.password);
  if (passworddata) {
    const token = jwt.sign({ id: user._id.toString() }, JWT_SCECRET, { expiresIn: '1d' });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Change to false if NOT using HTTPS
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({ msg: "Signin successful", token });
  } else {
    return res.status(401).json({ msg: "Invalid password" });
  }
});

/* ✅ Middleware to protect routes */
router.use(auth);

/* 📌 GET All Courses */
router.get("/allcourses", async (req, res) => {
  try {
    const courses = await AdminCourse.find({});
    res.status(200).json({ courses });
  } catch (error) {
    res.status(500).json({ msg: `Error fetching courses: ${error.message}` });
  }
});

/* 📌 GET Purchased Courses */
router.get("/purchasedCourses", async (req, res) => {
  const userid = req.userid;

  try {
    const user = await PurchasedCourses.findOne({ userid });
    if (!user || !user.purchasedcourses || user.purchasedcourses.length === 0) {
      return res.status(404).json({ msg: "No courses purchased" });
    }
    res.status(200).json({ data: [{ purchasedcourses: user.purchasedcourses }] });
  } catch (error) {
    res.status(500).json({ msg: `Error fetching purchased courses: ${error.message}` });
  }
});


/* 📌 Purchase a Course */
// router.post("/courses/:courseId", async (req, res) => {
//   const { courseId } = req.params;
//   const userid = req.userid; // Corrected from req.adminid to req.userid

//   try {
//     const course = await AdminCourse.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ msg: "Course ID not found" });
//     }

//     let purchasedCourses = await PurchasedCourses.find({ userid });
//     if (!purchasedCourses) {
//       purchasedCourses = new PurchasedCourses({ userid, purchasedcourses: [] });
//     }

//     if (purchasedCourses.purchasedcourses.includes(courseId)) {
//       return res.status(400).json({ msg: "You have already purchased this course" });
//     }

//     purchasedCourses.purchasedcourses.push(
//       {
//        id: courseId,
//         title:course.title
//       }
       
      
//     );
//     await purchasedCourses.save();

//     res.status(200).json({ msg: "Course purchased successfully" , data:purchasedCourses[0]});
//   } catch (err) {
//     res.status(500).json({ msg: `Error in purchasing course: ${err.message}` });
//   }
// });
// const mongoose = require("mongoose");
// const { ObjectId } = mongoose.Types;
// router.post("/courses/:courseId", async (req, res) => {
//   const { courseId } = req.params;
//   const userid = req.userid; // Set by auth middleware

//   if (!ObjectId.isValid(courseId)) {
//     return res.status(400).json({ msg: "Invalid course ID format" });
//   }

//   try {
//     // Fetch the course by its ID
//     const course = await AdminCourse.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ msg: "Course ID not found" });
//     }

//     // Find or create user's purchased courses document
//     let purchasedCourses = await PurchasedCourses.findOne({ userid });
//     if (!purchasedCourses) {
//       purchasedCourses = new PurchasedCourses({ userid, purchasedcourses: [] });
//     }

//     // Check if the course is already purchased
//     // const isAlreadyPurchased = purchasedCourses.purchasedcourses.some(course => course._id.toString() === courseId);
//     // console.log(purchasedCourses.purchasedcourses);
    
//     // console.log(isAlreadyPurchased);
    
//     // if (isAlreadyPurchased) {
//     //   return res.status(400).json({ msg: "You have already purchased this course" });
//     // }
//     const isAlreadyPurchased = purchasedCourses.purchasedcourses.some((course) => {
//       console.log(course._id);  // Logging the course ID (Make sure it's '_id' not 'courseId')
//       return course.courseId.toString() === courseId; // Ensure you return a boolean value for `.some()` to work correctly
//     });
    
//     console.log(isAlreadyPurchased);  // true if the course is already purchased, false otherwise
    
    
//     // Add course details to the user's purchased courses
//     purchasedCourses.purchasedcourses.push({
//       id: course._id,  // Store the ObjectId, not the string
//       title: course.title
//     });

//     await purchasedCourses.save();

//     res.status(200).json({ msg: "Course purchased successfully", data: purchasedCourses });
//   } catch (err) {
//     console.error("Error in purchasing course:", err);
//     res.status(500).json({ msg: `Error in purchasing course: ${err.message}` });
//   }
// });
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

router.post("/courses/:courseId", async (req, res) => {
  const { courseId } = req.params;
  const userid = req.userid; // Set by auth middleware

  if (!ObjectId.isValid(courseId)) {
    return res.status(400).json({ msg: "Invalid course ID format" });
  }

  try {
    // Fetch the course by its ID
    const course = await AdminCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: "Course ID not found" });
    }

    // Find or create user's purchased courses document
    let purchasedCourses = await PurchasedCourses.findOne({ userid });
    if (!purchasedCourses) {
      purchasedCourses = new PurchasedCourses({ userid, purchasedcourses: [] });
    }

    console.log('hi');
 
    const isAlreadyPurchased = purchasedCourses.purchasedcourses.some((purchasedCourse) => {
      console.log(purchasedCourse.courseId);  // Logging the courseId in the purchased courses
      return purchasedCourse.courseId.toString() === courseId;  // Compare IDs as strings
    });

    console.log(isAlreadyPurchased);

    if (isAlreadyPurchased) {
      return res.status(400).json({ msg: "You have already purchased this course" });
    }

    // Add course details to the user's purchased courses
    console.log(courseId);
    
    purchasedCourses.purchasedcourses.push({
      courseId: courseId,  // Storing the course ID correctly
      title: course.title,
      description:course.description
    });

    await purchasedCourses.save();

    res.status(200).json({ msg: "Course purchased successfully", data: purchasedCourses });
  } catch (err) {
    console.error("Error in purchasing course:", err);
    res.status(500).json({ msg: `Error in purchasing course: ${err.message}` });
  }
});


module.exports = router;
