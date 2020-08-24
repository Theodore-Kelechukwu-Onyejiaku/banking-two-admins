const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Account = require("../models/accountModel");
const router = require("../routes/adminRoutes");

const mongoose = require("mongoose");




exports.register = function(req, res){
    res.render("admin/admin-register")
}


exports.profile = function(req, res, next){
    Admin.findOne()
        .then(data =>{
            res.render("admin/profile", {data: data}) 
        })
        .catch(err =>{
            console.log("Cannot find any thing")
        })
}

//logout
exports.logout = function(req, res, next){
    res.cookie('auth', "");
    res.redirect("/login")
}

//view dashboard
exports.dashboard = function(req, res, next){
    var admin = req.user_data
    var d = new Date();
    var n = d.getHours();
    var o = d.getMinutes();
    var time = (n > 12) ? (n -12) +":" +o +"pm" : n + ":" +o + "am"

    User.find({"admin": req.user_data._id}).countDocuments()
        .then(data =>{
            res.render("admin/dashboard", {data: data, time: time, admin: admin});
        })
        .catch(err =>{
            console.log(err)
        })
}

//add user
exports.add_user = function(req, res, next){
    res.render("admin/add-user");
}

//View users
exports.view_users = function(req, res, next){
    // User.find({"admin": req.user_data._id})
    //     .then(data =>{
    //         res.render("admin/view-users", {data})
    //     })
    //     .catch(err =>{
    //         console.log(err)
    //     })


    User.find({"admin": req.user_data._id})
    .populate("admin")
    .exec((err, data)=>{
        if(!err){
            res.render("admin/view-users", {data})
        }else{
            console.log(err)
        }
    })
}

//view single user
exports.view_single_user = function(req, res, next){
    User.findById(req.params.id, (err, data)=>{
        if(!err){
            res.render("admin/single-user", {data: data})
        }else{
            console.log("Cannot find user")
        }
    })
}

exports.add_account_history = function(req, res){
    // User.find()
    //     .then(data =>{
    //         res.render("admin/add-account-history", {data: data})
    //     })
    //     .catch(err =>{
    //         console.log(err)
    //     })

        User.find({"admin": req.user_data._id})
                .populate("admin")
                .exec((err, data)=>{
                    if(!err){
                        res.render("admin/add-account-history", {data: data})
                    }else{
                        console.log(err)
                    }
                })
        
}



//POST REQUESTS
exports.register_post = function(req,res){
    var admin = new Admin(
        {
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password
        }
    );

    admin.save()
        .then(data =>{
            res.render("admin/admin-register", {message: "Registration Successful!"})
        })
        .catch(err =>{
            res.render("admin/admin-register", {message: "Unsuccessful!!!"})
        })
}

exports.update_profile = function(req, res){
    Admin.findOneAndUpdate({ _id: req.body._id},req.body, {new: true}, (err, data)=>{
        if(!err){
            res.render("admin/profile", {data: data, message: "Profile updated successfully!"})
        }else{
            console.log("Cannot find user")
        }
    })
}



exports.add_user_post = function(req, res, next){
    const file = req.file;
    
    //This removes the public from the file path, so we will have only "/uploads/users/*.jpg|png|gif"
    let Imgurl = file.path.replace("public", "");
    
    
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;
    var user = new User({
        admin: [req.user_data._id],
        account_number: req.body.account_number,
        account_name: req.body.account_name,
        username: req.body.username,
        password: req.body.password,
        telephone: req.body.telephone,
        routing_number: req.body.routing_number,
        account_balance: req.body.account_balance,
        account_type: req.body.account_type,
        userfile: Imgurl,
        status: req.body.status,
        date : today
    });
    
    user.save()
        .then(doc =>{
            console.log(req.body.user_id)
            console.log("User saved successfully");
        })
        .catch(err =>{
            console.log("Error adding user")
        })


    res.render("admin/add-user", {message: "User successfully added!"})
    next();
}

//Update user
exports.update_user = function(req, res, next){
    if(req.file){
        let file = req.file;
    
        //This removes the public from the file path, so we will have only "/uploads/users/*.jpg|png|gif"
        let Imgurl = file.path.replace("public", "");

            User.findByIdAndUpdate({_id: req.body._id},
                {
                    userfile: Imgurl,
                    account_number: req.body.account_number,
                    account_name: req.body.account_name,
                    username: req.body.username,
                    password: req.body.password,
                    telephone: req.body.telephone,
                    routing_number: req.body.routing_number,
                    account_balance: req.body.account_balance,
                    status: req.body.status,
                    account_type: req.body.account_type,
                },
                 {new: true}, (err, data)=>{
                if(!err){
                    res.render("admin/single-user", {data: data, message: "User updated!"})
                }else{
                    console.log("Cannot find user")
                }
            })
    }else{
        User.findByIdAndUpdate({_id: req.body._id},req.body, {new: true}, (err, data)=>{
            if(!err){
                res.render("admin/single-user", {data: data, message: "User updated!"})
            }else{
                console.log("Cannot find user")
            }
        })
    }
}


//Delete user
exports.delete_user= function(req, res, next){
    User.findByIdAndRemove(req.params.id, (err, doc)=>{
        if(!err){

            User.find({"admin": req.user_data._id})
                .populate("admin")
                .exec((err, data)=>{
                    if(!err){
                        res.render("admin/view-users", {data: data, message: "User deleted successfully!"})
                    }else{
                        console.log(err)
                    }
            })
            // User.find()
            //     .then(data =>{
            //         res.render("admin/view-users", {data: data, message: "User deleted successfully!"})
            //     })
            //     .catch(err =>{
            //         console.log(err)
            //     })
            // }else{
            // res.render("admin/view-users", {data: data, message: "Could not delete user!"})
        }
    })
}

//add account history
exports.add_account_history_post = function(req, res, next){    
            User.findById(req.body.user_id,(err, data)=>{
                if(!err){
                    const account = new Account({
                        user: [req.body.user_id],
                        deposit: req.body.deposit,
                        account_balance: req.body.balance,
                        withdrawals: req.body.withdrawals,
                        dateTwo: req.body.dateTwo,
                        description: req.body.description,
                        ref: req.body.ref,   
                    })
                    account.save(function(err){
                        if(err){
                            console.log("No account created!")
                        }else{
                            // User.find()
                            //     .then(data =>{
                            //         res.render("admin/add-account-history", {data: data, message: "Account History added Successfully!"})
                            //     })
                            //     .catch(err =>{
                            //         console.log(err)
                            //     })
                            User.find({"admin": req.user_data._id})
                                .populate("admin")
                                .exec((err, data)=>{
                                    if(!err){
                                        res.render("admin/add-account-history", {data: data, message: "Account History added Successfully!"})
                                    }else{
                                        console.log(err)
                                    }
                            })
                        }
                    })
                }else{
                    console.log("cannot find user!")
                }
            })
}