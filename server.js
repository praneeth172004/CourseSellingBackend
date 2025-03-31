const express = require("express");
const app = express();
const userroutes = require("./user_auth");
const adminroutes=require("./admin_auth");
const cookieParser = require("cookie-parser");
const dot=require("dotenv");
dot.config();
app.use(cookieParser())
const cors=require("cors")
app.use(express.json()); 
app.use(cors({
    origin: ["http://localhost:3000" ,"http://127.0.0.1:5500", "http://localhost:5500"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true 
}));

app.use("/user", userroutes);
app.use("/admin",adminroutes)

app.get("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false, 
    });
    return res.json({ msg: "You have successfully logged out." });
});

console.log(process.env.PORT);
const port=process.env.PORT || 3000


app.listen(process.env.PORT, () => console.log("Server running on port "+process.env.PORT));

// const express = require("express");
// const app = express();
// const userroutes = require("./user_auth");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");

// app.use(cookieParser());
// app.use(express.json());

// app.use(cors({
//     origin: "http://127.0.0.1:5500",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type"],
//     credentials: true
// }));

// app.use("/user", userroutes);

// app.listen(3001, () => console.log("Server running on port 3001"));

