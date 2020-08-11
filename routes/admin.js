const express = require('express');
const router = express.Router();
var User = require('../user');
var bcrypt = require('bcrypt-nodejs');

router.get('/setup',  (req, res) => {
    res.render('setup', {
        title: 'Setup',
        helpers: req.hbs.helpers
    });
});

router.get('/login', (req, res) => {
    res.render('login',{
    title: 'login',
    helpers: req.hbs.helpers
    });
});

router.get('/product_add', (req, res) => {
    res.render('product_add',{
    title: 'Add Product',
    helpers: req.hbs.helpers
    });
});


router.post('/login_action', function(req,res){
    User.findOne({'userEmail':req.body.email}, async function(err,user){
        if(err){
            console.log("Error!");
            return; 
        }
        if (!user) {
            console.log("No user found!");
            return; 
        }
        if (!bcrypt.compareSync(req.body.password,user.userPassword)) {
            console.log("Wrong Password!");
            return; 
        }
        req.session.user = user.usersName;
        req.session.usersEMail = user.userEmail;
        req.session.userId = user._id.toString();
        req.session.isAdmin = user.isAdmin;
        console.log("Login Success!");
        res.redirect('/')
        });
});

router.post('/setup_action', function(req,res){
    User.findOne({'userEmail':req.body.userEmail}, function(err,user){
        if(err){
            console.log(err);
            return; 
        }
        if (user) {
            console.log("User Already exists");
            return; 
        }
        var newUser= new User();
        newUser.usersName = req.body.usersName;
        newUser.userEmail = req.body.userEmail;
        newUser.userPassword = bcrypt.hashSync(req.body.userPassword);
        newUser.isAdmin = true;
        newUser.isOwner = true;
        newUser.save(function(err, result){
            if(err){
                console.log(err); 
                return; 
            }
            console.log("New User Commited to database");
        })
    });
    res.redirect('/admin/login')
});

module.exports = router;
