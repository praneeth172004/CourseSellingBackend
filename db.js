const mongoose = require("mongoose");
const dot=require("dotenv");
dot.config();
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Mongoose Successfully Connected");
  })
  .catch((err) => {
    console.log(`Mongoose connection issue:${err}`);
  });

const Schema = mongoose.Schema;
const objectid = Schema.ObjectId;

const user = new Schema({
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const admin = new Schema({
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const admin_course = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  published: {
    type: Boolean,
  },
  adminid: {
    type: mongoose.Types.ObjectId,
    ref: "admin",
    required: true,
  },
});
const purchasedCourses = new Schema({
  userid: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    requied: true,
  },
  purchasedcourses: [
    {
      courseId: {
        type: String,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
    },
  ],
});

const UserSchema = mongoose.model("user", user);
const AdminSchema = mongoose.model("admin", admin);
const AdminCourse = mongoose.model("admincourse", admin_course);
const PurchasedCourses = mongoose.model("purchasedCourses", purchasedCourses);
module.exports = {
  UserSchema,
  AdminSchema,
  AdminCourse,
  PurchasedCourses,
};
