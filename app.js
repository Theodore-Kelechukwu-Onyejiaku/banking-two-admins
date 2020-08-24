const express = require("express");
const app = express();
const request = require("request");
const path = require("path");
const bodyparser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

//Importing routes
const userRoutes = require("./routes/userRoutes")
const adminRoutes = require("./routes/adminRoutes")

const {validateRegistration, validateLogin} = require("./validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

//configuring dotenv
require("dotenv").config();
//Importing the body-parser middle ware
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());
app.use(cors());
//Use of cookies
app.use(cookieParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(express.static("public"))
app.use("/", userRoutes);
app.use("/admin", adminRoutes);



var mongoDB = "mongodb+srv://iceconnected:39913991@cluster0-kjwnq.mongodb.net/bank3?retryWrites=true&w=majority";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connections;
db.concat("error", console.error.bind(console, "MongoDB connection error."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log("Server running succesfully on port:"+PORT)
})