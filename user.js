var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var schema = new Schema ({
    usersName: {type: String, required:true},
    userEmail: {type: String, required:true},
    userPassword: {type: String, required:true},
    isAdmin: {type: Boolean},
    isOwner: {type: Boolean}
});

/*
schema.method.encryptPassword = function(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(5),null);
}

schema.method.validPassword = function(password){
    return bcrypt.compareSync(password,this.password);
}
*/

module.exports = mongoose.model('User', schema);