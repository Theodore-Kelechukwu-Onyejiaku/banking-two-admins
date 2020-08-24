const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accountSchema = new Schema({
    user:[{type: Schema.Types.ObjectId, ref: "User"}],
    account_balance: String,
    deposit: String,
    withdrawals: String,
    dateTwo : String,
    description: String,
    ref: String,
})

module.exports = mongoose.model("Account", accountSchema);