// app/models/user.js
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
// define the schema for our user model
var userSchema = mongoose.Schema({
	email : String,
	password : String,
});
// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
