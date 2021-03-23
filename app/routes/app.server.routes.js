// Load the 'index' controller
const HomeController = require('../controllers/home.server.controller');
const LoginController = require('../controllers/login.server.controller');
const ProfileController = require('../controllers/profile.server.controller');

// Define the routes module' method
module.exports = function (app) {
    // Mount the 'index' controller's 'render' method
    app.get('/', HomeController.index);
    app.get('/login', LoginController.renderSignin);
    app.post('/login', LoginController.authenticate, HomeController.home);
    app.get('/signup', LoginController.renderSignup);
    app.post('/signup', LoginController.signup);
    app.get('/signout', LoginController.signout);
    app.get('/users', LoginController.display);
    app.get('/welcome', LoginController.welcome);
    app.get('/home', LoginController.verifyUser, HomeController.home);
    app.get(
        '/profile/view',
        LoginController.verifyUser,
        ProfileController.editProfile
    );
    app.get(
        '/profile/edit',
        LoginController.verifyUser,
        ProfileController.editProfile
    );
    //app.post('/profile/save', LoginController.verifyUser);

    app.get('/checkout', HomeController.checkout);
    app.get('/orderhistory', HomeController.orderhistory);

};
