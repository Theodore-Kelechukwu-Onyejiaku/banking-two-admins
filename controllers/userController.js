const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Account = require("../models/accountModel");

const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken");
const async = require("async");

const cookieParser = require("cookie-parser");
const { getMaxListeners } = require("../models/userModel");
//configuring dotenv
require("dotenv").config();



exports.logout = function(req, res, next){
    res.cookie('auth', "");
    res.redirect("/login")
}

exports.investment_account = function(req, res, next){
    res.render("user/investment-account");
    next();
}

exports.saving_account = function(req, res, next){
    res.render("user/saving-account");
    next()
}

exports.checking_account = function(req, res, next){
    res.render("user/checking-account");
    next();
}

exports.mobile_banking = function(req, res, next){
    res.render("user/mobile-banking");
    next()
}


exports.who_we_are = function(req, res, next){
    res.render("user/who-we-are");
    next();
}

exports.contact_us = function(req, res, next){
    res.render("user/contact-us");
    next();
}

exports.careers = function(req, res, next){
    res.render("user/careers")
}

exports.application_form = function(req, res, next){
    res.render("user/application-form")
}



//POST METHODS
exports.email_us =async  function(req, res, next){
    const output = `
    <p>You have a new Applicant</p>
    <h3>Customer Details</h3>
    <ul>  
      <li>Title: ${req.body.name}</li>
      <li>First Name: ${req.body.firstname}</li>
      <li>Last Name: ${req.body.lastname}</li>
      <li>Email: ${req.body.your-email}</li>
      <li>Tel: ${req.body.tel}</li>
      <li>Sex: ${req.body.sex}</li>
      <li>Occupation: ${req.body.occupation}</li>
      <li>Nationality: ${req.body.nationality}</li>
      <li>Residential Address: ${req.body.othername}</li>
      <li>SSN: ${req.body.ssn}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;
  // create reusable transporter object using the default SMTP transport

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    host: "mail.ctbconect.com ",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
    // tls:{
    //   rejectUnauthorized:false
    // }
  });
 

   // setup email data with unicode symbols
   let mailOptions = {
        from: '"Application From:" '+req.body.email+'', // sender address
        to: 'customercare@ctbconect.com', // list of receivers
        subject: 'Application', // Subject line
        text: '', // plain text body
        html: output // html body
    };


    // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);   
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    res.render('user/contact-us' ,{message : "Application Successful"});
    });
}


//login page
exports.login = function(req, res, next){
    res.render("user/login");
    next()
}


//customer dashboard
exports.customer = function(req, res, next){

    async.parallel({
        user: function(callback){
                User.findById(req.user_data._id)
                .exec(callback)
        },
        account: function(callback){
                Account.findOne({user: req.user_data._id})
                    .populate("user")
                    .exec(callback)
        }
    }, function(err, results){

        if(err){
             console.log("User not found!")
             return next(err)
        }
        if(results.user === null){
            var err = new Error("Main user not found at all")
            err.status =   404;
            console.log("Main user not found at all")
            return next(err)
        }

        //successful
        res.render("user/customer", {data: results.user, account: results.account})
    })
}


//View account history
exports.account_history = function(req, res, next){
    async.parallel({
        user: function(callback){
                User.findById(req.user_data._id)
                .exec(callback)
        },
        account: function(callback){
                Account.find({"user": req.user_data._id})
                    .populate("user")
                    .exec(callback)
        }
    }, function(err, results){

        if(err){
             console.log("User not found!")
             return next(err)
        }
        if(results.user === null){
            var err = new Error("Main user not found at all")
            err.status =   404;
            console.log("Main user not found at all")
            return next(err)
        }

        //successful
        res.render("user/customer-account-history", {data: results.user, account: results.account})
    })
}


//delete account history
exports.account_history_delete = function(req, res, next){
    async.parallel({
        user: function(callback){
                User.findById(req.user_data._id)
                .exec(callback)
        },
        delete_account: function(callback) {
                Account.findByIdAndRemove(req.params.id)
                    .exec(callback)
        },
        account: function(callback){
                Account.find({"user": req.user_data._id})
                    .populate("user")
                    .exec(callback)
        }
    }, function(err, results){

        if(err){
             console.log("User not found!")
             return next(err)
        }
        if(results.user === null){
            var err = new Error("Main user not found at all")
            err.status =   404;
            console.log("Main user not found at all")
            return next(err)
        }

        //successful
        res.render("user/customer-account-history", {data: results.user, account: results.account, message: "Account history deleted successfully!"})
    })
}

//transfer
exports.transfer = function(req, res, next){
    User.findById(req.user_data._id, (err, data)=>{
        if(!err){
            res.render("user/transfer", {data: data})
        }else{
            console.log("Cannot find user")
        }
    })
}

//international transfer
exports.international_transfer = function(req, res, next){
    User.findById(req.user_data._id, (err, data)=>{
        if(!err){
            res.render("user/international-transfer", {data: data})
        }else{
            console.log("Cannot find user")
        }
    })
}

//inter bank transfer
exports.inter_bank = function(req, res, next){
    User.findById(req.user_data._id, (err, data)=>{
        if(!err){
            res.render("user/inter-bank", {data: data})
        }else{
            console.log("Cannot find user")
        }
    })
}


exports.change_password = function(req, res, next){
    User.findById(req.user_data._id, (err, data)=>{
        if(!err){
            res.render("user/change-password", {data: data})
        }else{
            console.log("Cannot find user")
        }
    })
}



//View one's profile
exports.my_profile = function(req, res, next){
    User.findById(req.user_data._id, (err, data)=>{
        if(!err){
            res.render("user/profile", {data: data})
        }else{
            console.log("Cannot find user")
        }
    })
}


//POST REQUESTS

//Change password post request
exports.change_password_post = function(req, res, next){
    User.findByIdAndUpdate({ _id: req.body._id},{password: req.body.new_password}, {new: true}, (err, data)=>{
        if(!err){
            res.render("user/change-password", {data: data, message: "Password Updated!"})
        }else{
            console.log("Cannot find user")
        }
    })
}




exports.login_post = function(req, res, next){
    
            // User.findOne({username: req.body.username})
            //     .then(data =>{
            //         if(data.password === req.body.password){
            //             const token = jwt.sign(data.toJSON(), process.env.TOKEN_SECRET, {  expiresIn: '59m' });
            //             res.cookie('auth', token);
            //             res.redirect("/customer")
            //         }else{
            //             res.render("user/login", {message: "Username or password is wrong!!!"})
            //         }
            //     })
            //     .catch(err => {
                    Admin.findOne({username: req.body.username})
                        .then(data =>{
                                const token = jwt.sign(data.toJSON(), process.env.TOKEN_SECRET, {  expiresIn: '59m' });
                                console.log("can login now")
                                res.cookie('auth', token);
                                res.redirect("/admin")
                        })
                        .catch(err =>{
                            console.log(err)
                            res.render("user/login", {message: "No admin found"})
                        })
                
}