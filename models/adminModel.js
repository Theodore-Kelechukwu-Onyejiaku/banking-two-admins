const mongoose = require("mongoose");
const { mongo } = require("mongoose");

const Schema = mongoose.Schema;

var adminSchema = new Schema({
    username: String,
    firstname: String,
    lastname: String,
    email: String,
    password: String
})

module.exports = mongoose.model("Admin", adminSchema);