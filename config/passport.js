var passport = require('passport');
var User = require('../user');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');


passport.serializeUser(function(user,done){
    done(null,user.id);
});

passport.deserializeUser(function(id,done){
    User.findById(id,function(err, user){
        done(err,user);
    })
});

passport.use('local.signup',new LocalStrategy({
    usernameField:'userEmail',
    passwordField:'userPassword',
    passReqToCallback: true
}, function(req, username, password, done){
    console.log("passport.use is called");
    User.findOne({'userEmail':username}, function(err,user){
        if(err){
            return done(err); 
        }
        if (user) {
            return done(null,user);
        }
        var newUser= new User();
        newUser.usersName = req.body.usersName;
        newUser.userEmail = req.body.userEmail;
        newUser.userPassword = bcrypt.hashSync(req.body.userPassword,bcrypt.genSaltSync(5),null);
        newUser.isAdmin = true;
        newUser.isOwner = true;
        newUser.save(function(err, result){
            if(err){
                return done(err); 
            }
            return done(null, newUser);
        })
    });
}));

passport.use('local.signin',new LocalStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback: true
}, function(req, username, password, done){
    User.findOne({'userEmail':username}, function(err,user){
        if(err){
            console.log("Error!");
            return done(err); 
        }
        if (!user) {
            console.log("No user found!");
            return done(null, false, {message:'No user found'});
        }
        if (!bcrypt.compareSync(password,user.userPassword)) {
            console.log("Wrong Password!");
            return done(null, false, {message:'Wrong password'});
        }
        return done(null, user);
        })
}));
