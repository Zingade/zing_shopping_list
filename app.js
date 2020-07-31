const express = require('express');
let handlebars = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.engine('hbs', handlebars({
    extname: 'hbs',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    defaultLayout: 'layout.hbs',
    partialsDir: [path.join(__dirname, 'views')]
}));

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

app.post('/addtocart', async (req, res, next) => {
    console.log(req.body);
});

// Setup the routes
app.get('/', function(rep,res){
    var results = [
        {
            _id : 1,
            productName : "Bombay Rava",
            productDesc : "Slect in KGs",
            productImage : "uploads/BombayRava.jpg"
        },
        {
            _id : 2,
            productName : "Udad Daal",
            productDesc : "Slect in KGs",
            productImage : "uploads/Udad-daal.jpg"
        },
        {
            _id : 3,
            productName : "Kabuli Chana",
            productDesc : "Slect in KGs",
            productImage : "uploads/Kabuli-Chana.jpg"
        },
        {
            _id : 4,
            productName : "Matki",
            productDesc : "Slect in KGs",
            productImage : "uploads/Matki.jpg"
        },
        {
            _id : 5,
            productName : "Medium-Poha",
            productDesc : "Slect in KGs",
            productImage : "uploads/Medium-Poha.jpg"
        },
        {
            _id : 6,
            productName : "Raajma",
            productDesc : "Slect in KGs",
            productImage : "uploads/Raajma.jpg"
        },
        {
            _id : 7,
            productName : "Sona-Masoori",
            productDesc : "Slect in KGs",
            productImage : "uploads/Sona-Masoori.jpg"
        },
    ];
    res.render('index',{title:'Zing Shop', helpers: handlebars.helpers, results:results});
});

app.listen(app.get('port'),()=>{
    console.log('Server is running....', 4000);
});

module.exports = app;
