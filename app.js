const express = require('express');
let handlebars = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
const admin = require('./routes/admin');
const accountSid = 'XXXXXX'; 
const authToken = 'YYYYYYY'; 
const client = require('twilio')(accountSid, authToken); 
const Product = mongoose.model('Product');
var Cart = require('./database/cart');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.engine('hbs', handlebars({
    extname: 'hbs',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    defaultLayout: 'layout.hbs',
    partialsDir: [path.join(__dirname, 'views')]
}));

var MongoStore = require('connect-mongo')(session);
mongoose.connect('mongodb://localhost:27017/zing-shopping',{ useNewUrlParser: true, useUnifiedTopology: true });
require('./config/passport');

app.set('view engine', 'hbs');

handlebars = handlebars.create({
    helpers: {
        ifCond: (v1, operator, v2, options) => {
            switch(operator){
                case '==':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!=':
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        },
        perRowClass: (numProducts) => {
            if(parseInt(numProducts) === 1){
                return 'col-6 col-md-12 product-item';
            }
            if(parseInt(numProducts) === 2){
                return 'col-6 col-md-6 product-item';
            }
            if(parseInt(numProducts) === 3){
                return 'col-6 col-md-4 product-item';
            }
            if(parseInt(numProducts) === 4){
                return 'col-6 col-md-3 product-item';
            }

            return 'col-md-6 product-item';
        },
        feather: (icon) => {
            // eslint-disable-next-line keyword-spacing
            return `<svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="feather feather-${icon}"
                >
                <use xlink:href="/dist/feather-sprite.svg#${icon}"/>
            </svg>`;
        }
    }
});

app.set('port', process.env.PORT || 4000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules', 'feather-icons')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use((req,res,next)=>{
    req.hbs = handlebars;
    res.locals.session = req.session;
    next();
});

app.use(session({
    secret:'zingsupersecret',
    resave:false, 
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection:mongoose.connection}),
    cookie: { maxAge: 180 * 60 * 1000 }
  }));

  app.use('/admin', admin);

  app.use(passport.initialize());
  app.use(passport.session());
    
app.post('/addtocart', async (req, res, next) => {

    productId = req.body.productId;
    var cart = new Cart(req.session.cart?req.session.cart:{});
    Product.findById(productId, function(err, product){
        if(err){
            console.log("Error in finding the "+productId+'in Database');
            return res.redirect('/');
        }
        cart.add(product, productId);
        req.session.cart = cart;
        res.redirect('/');
    });
});

app.post('/updatecart', async (req, res, next) => {

    const cartItem = req.body;
    productId = req.body.productId;
    // Check cart exists

    if(!req.session.cart){
        emptyCart(req, res, 'json', 'There are no items if your cart or your cart is expired');
        return;
    }

    Product.findById(productId, function(err, product){
        if(err){
            console.log("Error in finding the "+productId+'in Database');
            return res.redirect('/');
        }
    });

    // Calculate the quantity to update
    let productQuantity = cartItem.quantity ? cartItem.quantity : 1;
    if(typeof productQuantity === 'string'){
        productQuantity = parseInt(productQuantity);
    }

    if(productQuantity === 0){
        // quantity equals zero so we remove the item
        delete req.session.cart[cartItem.productId];
        console.log("There was an error updating the cart");
        return;
    }


    // Check for a cart
    if(!req.session.cart.items[cartItem.productId]){
        console.log("There was an error updating the cart");
        return;
    }

    const cartProduct = req.session.cart.items[cartItem.productId];

    const deltaQty = productQuantity - req.session.cart.items[cartItem.productId].Qty; 
    req.session.cart.items[cartItem.productId].Qty = productQuantity; 
    req.session.cart.items[cartItem.productId].price = productQuantity * cartProduct.item.productPrice;
    req.session.cart.totalQty += deltaQty;
    req.session.cart.totalPrice += deltaQty * cartProduct.item.productPrice;


    Product.updateOne({ sessionId: req.session.id }, {
        $set: { cart: req.session.cart }
    });

    res.redirect('/');
});


app.post('/removefromcart', async (req, res, next) => {

    productId = req.body.productId;

    // Check for item in cart
    if(!req.session.cart.items[productId]){
        console.log(req.body, 'Product not found in cart');
    }

    req.session.cart.totalQty -= req.session.cart.items[productId].Qty;
    req.session.cart.totalPrice -= req.session.cart.items[productId].price;

    // remove item from cart
    delete req.session.cart.items[productId];

    console.log('Product successfully removed');
    res.redirect('/');
});

app.get('/checkout/information', (req, res) => {
    client.messages 
    .create({ 
       body: 'Bombay Rava 500gm', 
       from: 'whatsapp:+14155238886',       
       to: 'whatsapp:+919845210251' 
     }) 
    .then(message => console.log(message.sid)) 
    .done();
});

app.get('/checkout/cart', (req, res) => {


    var results = [
        {
            _id : 1,
            productName : "Bombay Rava1",
            productDesc : "Slect in KGs",
            productImage : "/uploads/BombayRava.jpg"
        },
        {
            _id : 2,
            productName : "Udad Daal",
            productDesc : "Slect in KGs",
            productImage : "/uploads/Udad-daal.jpg"
        },
        {
            _id : 3,
            productName : "Kabuli Chana",
            productDesc : "Slect in KGs",
            productImage : "/uploads/Kabuli-Chana.jpg"
        },
        {
            _id : 4,
            productName : "Matki",
            productDesc : "Slect in KGs",
            productImage : "/uploads/Matki.jpg"
        },
        {
            _id : 5,
            productName : "Medium-Poha",
            productDesc : "Slect in KGs",
            productImage : "/uploads/Medium-Poha.jpg"
        },
        {
            _id : 6,
            productName : "Raajma",
            productDesc : "Slect in KGs",
            productImage : "/uploads/Raajma.jpg"
        },
        {
            _id : 7,
            productName : "Sona-Masoori",
            productDesc : "Slect in KGs",
            productImage : "/uploads/Sona-Masoori.jpg"
        },
    ];

    res.render(`checkout-cart`, {
        title: 'Checkout - Cart',
        helpers: handlebars.helpers,
        results:results
    });
});


// Setup the routes
app.get('/', function(req,res){
    Product.find((err, docs) => {
        if (err) {
            console.log('Error in retrieving product list :' + err);
            return;
        }
        var results=[];
        for(var i=0;i<docs.length;i++)
        {
            results[i]=docs[i].toObject();
        }

        cart = new Cart(req.session.cart||{});
        arr  = cart.generateArray();
        res.render('index',{title:'Zing Shop', helpers: handlebars.helpers, main_results:results,results:arr, totalQty:cart.totalQty, totalPrice:cart.totalPrice,admin:req.session.isAdmin});
    });
});


app.listen(app.get('port'),()=>{
    console.log('Server is running....', 4000);
});


module.exports = app;
