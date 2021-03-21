// Load the module dependencies
const User = require('mongoose').model('User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const jwtExpirySeconds = 300;
const jwtKey = config.secretKey;

const getErrorMessage = function (err) {
    // Define the error message variable
    var message = '';

    // If an internal MongoDB error occurs get the error message
    if (err.code) {
        switch (err.code) {
            // If a unique index error occurs set the message error
            case 11000:
            case 11001:
                message = 'Username already exists';
                break;
            // If a general error occurs set the message error
            default:
                message = 'Something went wrong';
        }
    } else {
        // Grab the first error message from a list of possible errors
        for (const errName in err.errors) {
            if (err.errors[errName].message)
                message = err.errors[errName].message;
        }
    }

    // Return the message error
    return message;
};

exports.renderSignin = function (req, res, next) {
    res.render('login/signin', {
        pageTitle: 'Sign-in Form',
    });
};

exports.renderSignup = function (req, res, next) {
    res.render('login/signup', {
        pageTitle: 'Sign-up Form',
    });
};

exports.signup = function (req, res, next) {
    const user = new User(req.body);
    const message = null;
    user.save((err) => {
        if (err) {
            const message = getErrorMessage(err);
            console.log(message);
            // save the error in flash
            //req.flash('error', message); //save the error into flash memory

            // Redirect the user back to the signup page
            return res.redirect('/signup');
        }

        // Redirect the user back to the main application page
        return res.redirect('/');
    });
};
//
exports.authenticate = function (req, res, next) {
    // Get credentials from request body
    const { email, password } = req.body;
    console.log(email);
    //find the user with given email using static method findOne
    User.findOne({ email: email }, (err, user) => {
        if (err) {
            return next(err);
        } else {
            console.log(user);
            //compare passwords
            if (bcrypt.compareSync(password, user.password)) {
                // Create a new token with the user id in the payload
                // and which expires 300 seconds after issue
                const token = jwt.sign({ id: user._id }, jwtKey, {
                    algorithm: 'HS256',
                    expiresIn: jwtExpirySeconds,
                });
                console.log('token:', token);
                req.body.userId = user._id;
                // set the cookie as the token string, with a similar max age as the token
                // here, the max age is in milliseconds
                res.cookie('token', token, {
                    maxAge: jwtExpirySeconds * 1000,
                    httpOnly: true,
                });
                //res.status(200).send({ email: email });
                //res.json({status:"success", message: "user found!!!", data:{user:
                //user, token:token}});
                //call the next middleware
                // res.render('index', {
                //     pageTitle: 'Brew4You',
                //     customerName: user.fullName,
                // });
                // res.redirect('/home');
                next();
            } else {
                res.json({
                    status: 'error',
                    message: 'Invalid email/password!!!',
                    data: null,
                });
            }
        }
    });
};
// exports.signout = (req, res) => {
//     console.log(req.cookies);
//     res.clearCookie('token');
//     return res.status('200').json({ message: 'signed out' });
//     // Redirect the user back to the main application page
//     //res.redirect('/')
// };

exports.verifyUser = function (req, res, next) {
    const token = req.cookies.token;
    console.log('verify user ' + token);
    if (!token) {
        return res.redirect('/login');
    }
    var payload;
    try {
        payload = jwt.verify(token, jwtKey);
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            // if the error thrown is because the JWT is unauthorized, return a 401 error
            //return res.status(401).end();
            return res.render('error/error-page', {
                pageTitle: 'Unauthorized',
                errorCode: 401,
                errorMessage: 'Unauthorized Request',
            });
        }
        // otherwise, return a bad request error
        return res.render('error/error-page', {
            pageTitle: 'Server Error',
            errorCode: 500,
            errorMessage: 'Internal Server Error',
        });
    }

    // Finally, return the welcome message to the user, along with their
    // username given in the token
    console.log(payload);
    req.body.userId = payload.id;
    next();
    // res.send(`Welcome user with ID: ${payload.id}!`);
    // jwt.verify(req.headers['x-access-token'], jwtKey, function (err, decoded) {
    //     if (err) {
    //         res.json({ status: 'error', message: err.message, data: null });
    //         //res.redirect('/login');
    //     } else {
    //         // add user id to request
    //         req.body.userId = decoded.id;
    //         next();
    //     }
    // });
};
// protected page uses the JWT token
exports.welcome = (req, res) => {
    // We can obtain the session token from the requests cookies,
    // which come with every request
    const token = req.cookies.token;

    // if the cookie is not set, return an unauthorized error
    if (!token) {
        return res.status(401).end();
    }

    var payload;
    try {
        // Parse the JWT string and store the result in `payload`.
        // Note that we are passing the key in this method as well. This method will throw an error
        // if the token is invalid (if it has expired according to the expiry time we set on sign in),
        // or if the signature does not match
        payload = jwt.verify(token, jwtKey);
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            // if the error thrown is because the JWT is unauthorized, return a 401 error
            return res.status(401).end();
        }
        // otherwise, return a bad request error
        return res.status(400).end();
    }

    // Finally, return the welcome message to the user, along with their
    // username given in the token
    console.log(payload);
    res.send(`Welcome user with ID: ${payload.id}!`);
};

// Create a new controller method for signing out
exports.signout = function (req, res) {
    // Redirect the user back to the main application page
    res.clearCookie('token');
    res.redirect('/');
};
//
// 'display' controller method to display all users in friendly format
exports.display = function (req, res, next) {
    // Use the 'User' static 'find' method to retrieve the list of users
    User.find({}, (err, users) => {
        if (err) {
            // Call the next middleware with an error message
            return next(err);
        } else {
            // Use the 'response' object to send a JSON response
            res.json(users);
            // res.render('listall', {
            //     title: 'List All Users',
            //     users: users,
            // });
        }
    });
};
