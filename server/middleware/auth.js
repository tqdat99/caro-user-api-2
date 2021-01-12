var passport = require('passport');
require('../passport/passport')(passport);
const facebookAppToken = process.env.FACEBOOK_APP || '4166090010091919|5558yQbRtuqtUNI8uJfcSkqC3ig';
const googleApp = process.env.GOOGLE_CONSUMER_KEY || '846280586932-oabrjoonglegin6tf7q1qn6jm192g0qn.apps.googleusercontent.com'
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports.isLoggedIn = (req, res, next) => {
    if (req.headers.authorization) {
        var xmlHttp = new XMLHttpRequest(),
            data,
            inputToken = req.headers.authorization.substr(7, req.headers.authorization.length);

        //Authorize facebook token
        let theUrl = 'https://graph.facebook.com/debug_token?input_token=' + inputToken + '&access_token=' + facebookAppToken;
        xmlHttp.open("GET", theUrl, false);
        xmlHttp.send(null);
        data = JSON.parse(xmlHttp.responseText.substr(8, xmlHttp.responseText.length - 9));
        if (data.is_valid && data.application == 'caro') {
            console.log('Facebook authorized');
            return next();
        }

        //Authorize google token
        theUrl = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + inputToken;
        xmlHttp.open("GET", theUrl, false);
        xmlHttp.send(null);
        data = JSON.parse(xmlHttp.responseText.substr(0, xmlHttp.responseText.length));
        if (data.expires_in > 0 && data.issued_to == googleApp) {
            console.log('Google authorized');
            return next();
        }
    }

    //Authorize using jwt
    passport.authenticate('jwt', { session: false }, function (err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.send("Unauthorized").end(); }
        console.log('JWT authorized')
        return next();
    })(req, res, next);
}