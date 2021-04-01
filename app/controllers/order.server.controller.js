// Load the 'Order' Mongoose model
var Order = require('mongoose').model('Order');
var Product = require('mongoose').model('Product');

const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const jwtKey = config.secretKey;
const cart = 'Cart';
const paid = 'Paid';
const ordered = 'Ordered';
// Create a new 'createOrder' controller method
exports.createOrder = function (req, res, next) {
    // if user is authenticate, do something special
    const isAuthenticate = req.cookies.token != undefined;
    var payload = null;
    try {
        payload = jwt.verify(req.cookies.token, jwtKey);
    } catch (e) {
        console.log('Not logged in');
    }

    // Set cookie
    if (req.cookies.tempoId == null) {
        res.cookie('tempoId', req.body.temporaryId);
    }

    //Create a new instance of the 'Order' Mongoose model
    if (payload == null) {
        var order = new Order({
            title: req.body.title,
            content: req.body.content,
            price: req.body.price,
            quantity: req.body.quantity,
            stage: cart,
            temporaryId: req.cookies.tempoId,
        });
    } else {
        var order = new Order({
            title: req.body.title,
            content: req.body.content,
            price: req.body.price,
            quantity: req.body.quantity,
            stage: cart,
            user: payload.id,
        });
    }

    // Use the 'Order' instance's 'save' method to save a new order document
    order.save(function (err) {
        if (err) {
            // Call the next middleware with an error message
            return next(err);
        } else {
            // Use the 'response' object to send a JSON response
            //res.json(order);
            console.log(order);
        }
    });

    //Use the 'Product' static 'find' method to retrieve the list of items
    Product.find({}, function (err, products) {
        //console.log(product)
        if (err) {
            // Call the next middleware with an error message
            console.log('some error in readMenuList method');
            return next(err);
        } else {
            res.render('menu_list/menu_list', {
                pageTitle: 'Menu List',
                isAuthenticate: isAuthenticate,
                userId: payload != null ? payload.id : null,
                product: products,
            });
        }
    });
};

exports.readCart = function (req, res, next) {
    const isAuthenticate = req.cookies.token != undefined;
    var payload = null;
    try {
        payload = jwt.verify(req.cookies.token, jwtKey);
    } catch (e) {
        console.log('Not logged in');
    }

    var userId = payload != null ? payload.id : null;

    if (req.cookies.tempoId != null || userId != null) {
        let query =
            userId != null
                ? { user: userId, stage: cart }
                : { temporaryId: req.cookies.tempoId, stage: cart };

        Order.find(query, function (err, orders) {
            //console.log(order)
            if (err) {
                // Call the next middleware with an error message
                console.log('some error in readOrder method');
                return next(err);
            } else {
                //
                console.log(orders);
                res.render('cart/cart', {
                    pageTitle: cart,
                    order: orders,
                    isAuthenticate: isAuthenticate,
                });
            }
        });
    } else {
        res.redirect('/menu_list');
    }
};

exports.updateById = function (req, res, next) {
    let query = { _id: req.params.orderId };

    // Use the 'Order' static 'findOneAndUpdate' method
    // to update a specific order by order id
    Order.findOneAndUpdate(query, req.body, (err, order) => {
        if (err) {
            console.log(err);
            // Call the next middleware with an error message
            return next(err);
        } else {
            console.log(order);
            // Use the 'response' object to send a JSON response
            res.redirect('/cart'); //display all orders
        }
    });
};

exports.deleteById = function (req, res, next) {
    //initialize findOneAndUpdate method arguments
    var query = { _id: req.params.orderId };

    // Use the 'Order' static 'findOneAndUpdate' method
    // to update a specific order by order id
    Order.remove(query, (err, order) => {
        if (err) {
            console.log(err);
            // Call the next middleware with an error message
            return next(err);
        } else {
            console.log(order);

            // Use the 'response' object to send a JSON response
            res.redirect('/cart'); //display all order
        }
    });
};

exports.readCheckout = function (req, res, next) {
    const isAuthenticate = req.cookies.token != undefined;
    var payload = null;
    try {
        payload = jwt.verify(req.cookies.token, jwtKey);
    } catch (e) {
        console.log('Not logged in');
    }

    var userId = payload != null ? payload.id : null;

    if (req.cookies.tempoId != null || userId != null) {
        let query =
            userId != null
                ? { user: userId, stage: cart }
                : { temporaryId: req.cookies.tempoId, stage: cart };

        Order.find(query, function (err, orders) {
            if (err) {
                // Call the next middleware with an error message
                console.log('some error in readOrder method');
                return next(err);
            } else {
                var subTotal = 0;
                for (let i = 0; i < orders.length; i++) {
                    subTotal += orders[i].quantity * orders[i].price;
                }
                var tax = subTotal * 1.13 - subTotal;
                var delivery = 3;
                var totalSum = subTotal * 1.13 + delivery;
                //
                res.render('checkout/checkout', {
                    pageTitle: 'Checkout',
                    order: orders,
                    subTotal: subTotal.toFixed(2),
                    totalSum: totalSum.toFixed(2),
                    tax: tax.toFixed(2),
                    delivery: delivery.toFixed(2),
                    isAuthenticate: isAuthenticate,
                });
            }
        });
    } else {
        res.redirect('/menu_list');
    }
};

exports.pay = function (req, res, next) {
    var payload = null;
    try {
        payload = jwt.verify(req.cookies.token, jwtKey);
    } catch (e) {
        console.log('Not logged in');
    }

    var userId = payload != null ? payload.id : null;

    if (req.cookies.tempoId != null || userId != null) {
        let query =
            userId != null
                ? { user: userId, stage: cart }
                : { temporaryId: req.cookies.tempoId, stage: cart };

        Order.find(query, function (err, orders) {
            if (err) {
                return next(err);
            } else {
                for (let i = 0; i < orders.length; i++) {
                    orders[i].stage = paid;
                    orders[i].status = ordered;
                    //orders[i].trackingNumber = randomNumber;
                    orders[i].save();
                }

                res.render('thank_you/thank_you', {
                    pageTitle: 'Thank You',
                });
            }
        });
    } else {
        res.redirect('/menu_list');
    }
};
