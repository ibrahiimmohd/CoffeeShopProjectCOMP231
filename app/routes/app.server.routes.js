// Load controllers
const HomeController = require('../controllers/home.server.controller');
const LoginController = require('../controllers/login.server.controller');
const ProfileController = require('../controllers/profile.server.controller');
const ProductController = require('../controllers/product.server.controller');
// Define the routes module' method
module.exports = function (app) {

    app.get('/', HomeController.index);
    app.get('/login', LoginController.renderSignin);
    app.post('/login', LoginController.authenticate, HomeController.home);
    app.get('/signup', LoginController.renderSignup);
    app.post('/signup', LoginController.signup);
    app.get('/signout', LoginController.signout);
    app.get('/users', LoginController.display);
    app.get('/welcome', LoginController.welcome);
    app.get('/home', LoginController.verifyUser, HomeController.home);
    app.get('/profile/view', LoginController.verifyUser, ProfileController.editProfile);
    app.get('/profile/edit', LoginController.verifyUser, ProfileController.editProfile);

    //app.post('/profile/save', LoginController.verifyUser);

    //show the 'add_product' page if a GET request is made to /product
    app.route('/add_product').get(ProductController.renderAdd);

    // a post request to /product will execute createProduct method in product.server.controller
    app.route('/products').post(ProductController.createProduct);
    
    app.route('/list_products').get(ProductController.readProduct);

    // Set up the 'courses' parameterized routes
    app.route('/list_products/:productId')
        .get(ProductController.read)
        .put(ProductController.updateByProductId)
        .delete(ProductController.deleteByProductId);

    // Set up the 'productId' parameter middleware
    //All param callbacks will be called before any handler of 
    //any route in which the param occurs, and they will each 
    //be called only once in a request - response cycle, 
    //even if the parameter is matched in multiple routes
    app.param('productId', ProductController.findProductByProductId);
};
