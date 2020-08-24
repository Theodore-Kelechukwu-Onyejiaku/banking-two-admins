//This is a middleware that we add to any private 
//route to check if there is any token or valid token

const jwt = require("jsonwebtoken");

module.exports = function (req, res, next){
    var token = req.cookies.auth;
    // decode token
    if (token) {
  
        jwt.verify(token, 'secret', function(err, token_data) {
          if (err) {
             return res.status(403).send('Error');
          } else {
            req.user = token_data;
            // console.log(token_data);
            next();
          }
        });
      } else {
        return res.status(403).send('No token');
      }   
}