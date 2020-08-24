const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController")
const jwt = require("jsonwebtoken");

//Middleware to verify token
function verify(req, res, next) {
    var token = req.cookies.auth;
    // decode token
    if (token) {
      jwt.verify(token, process.env.TOKEN_SECRET, function(err, token_data) {
        if (err) {
            console.log("YOu must login to view this page")
           return res.status(403).render('user/login', {message: "Please you must login to view this page"});
        } else {
          req.user_data = token_data;
          next();
        }
      });
    } else {
        return res.status(403).render('user/login', {message: "Please you must login to view this page"});
    }
  }




router.get("/investment-account", userController.investment_account)
router.get("/saving-account", userController.saving_account)
router.get("/checking-account", userController.checking_account)
router.get("/mobile-banking", userController.mobile_banking)
router.get("/online-banking", userController.login)


router.get("/apply", userController.application_form)
router.get("/contact", userController.contact_us)
router.get("/login", userController.login)
router.get("/who-we-are", userController.who_we_are)
router.get("/career", userController.careers)



//POST REQUESTS
router.post("/contact", userController.email_us);
router.post("/login", userController.login_post);

//Protected Routes
router.get("/customer",verify, userController.customer);
router.get("/customer/account-history", verify, userController.account_history);
router.get("/customer/transfer", verify, userController.transfer);
router.get("/customer/transfer/international-bank-transfer",verify, userController.international_transfer);
router.get("/customer/transfer/inter-bank", verify, userController.inter_bank)
router.get("/customer/change-password", verify, userController.change_password)
router.get("/customer/my-profile", verify, userController.my_profile)
router.get("/logout", verify, userController.logout)
router.get("/customer/account-history/delete/:id", verify, userController.account_history_delete);


//Post and Protected Requests
router.post("/customer/change-password", verify, userController.change_password_post);



module.exports = router;
