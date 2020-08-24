const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    admin : [{type: Schema.Types.ObjectId, ref: "Admin"}],
    account_number: String,
    account_name: String,
    username: String,
    password: String,
    telephone: String,
    routing_number: String,
    account_balance: String,
    account_type: String,
    userfile: String,
    status: String,
    date: String,
})

module.exports = mongoose.model("User", userSchema);