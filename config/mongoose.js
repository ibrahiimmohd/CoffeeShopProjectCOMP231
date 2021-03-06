// Load the module dependencies
var config = require('./config');
var mongoose = require('mongoose');

// Define the Mongoose configuration method
module.exports = function () {
    // Use Mongoose to connect to MongoDB
    //const db = mongoose.connect(config.db);
    var db = mongoose
        .connect(config.db, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
        })
        .then(() => console.log('DB Connected!'))
        .catch((err) => {
            console.log('Error');
        });

    // Load the 'User' model
    require('../app/models/user.server.model');

    // Load the 'Product' model
    require('../app/models/product.server.model');

    // Load the 'Staff' model
    require('../app/models/staff.server.model');

    // Load the 'Order' model
    require('../app/models/order.server.model');

    // Load the 'Review' model
    require('../app/models/review.server.model');

    // Return the Mongoose connection instance
    return db;
};
