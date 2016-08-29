// ********************************************
// API
// Version: 0.2
// Author : Saptarshi Ghosh
// ********************************************
var bcrypt   		= require('bcrypt-nodejs');
var jwt  			= require('jsonwebtoken');
var User       		= require('./models/user');
var config 			= require('../config/database.js');
module.exports 		= function(app) {
	app.get('/profile',isAuth,function(req,res){
		var bearerToken;
	    var bearerHeader = req.headers["authorization"];
	    if (typeof bearerHeader !== 'undefined') {
	        var bearer = bearerHeader.split(" ");
	        bearerToken = bearer[1];
	        req.token = bearerToken;
	        var decodedtoken = jwt.decode(bearerToken);
	        if(decodedtoken.iss=='gooblu'){
				User.findOne({"email":decodedtoken.email},function(err,data) {
					return res.status(201).send({message:"success","info":data});
				});
	        }else{
	        	res.json({"message":"NA"});
	        };
	    }else{
	    	res.json({"message":"NA"});
	    };
	});
// *****************************************************************
// Login and Signup
// *****************************************************************
    //Check if user is logged in
    app.post('/loginstat',isAuth,function(req,res){
    	User.findOne({"email":req.tokeninfo.email},function(err,data){
    		if(!err){
    			res.json({"message":"success"});
    		}else{
    			res.json({"message":"NA"});
    		};
    	});    	
    });
    //User Login
	app.post('/login',function(req, res){
		if(!req.body.username || !req.body.password){
			return res.json({message:"NA"});
		}
		User.findOne({"email":req.body.username},function(err,user){
			if(user && bcrypt.compareSync(req.body.password, user.password) && !err){
				res.json({message:"success",id_token:createToken(req.body.username)});
			}else{
				res.json({message:"NA"});
			}
		});
	});
	//Signup with email and password
	app.post('/signup',function(req, res){
		if(!req.body.user.email || !req.body.user.password){
			return res.json({message:"Must provide credentials"});
		}else{
			User.findOne({"email":req.body.user.email},function(err,user){
				if(!err){
					if(user){
						return res.json({message:"User Already exist"});
					}else{
						var newUser  = new User();
						newUser.email= req.body.user.email;
						newUser.password = bcrypt.hashSync(req.body.user.password, bcrypt.genSaltSync(8), null);
				        newUser.save(function(err,u) {
				            if (err)
				                throw err;
				            return res.json({message:"success",id_token:createToken(req.body.user.email)});
				        });  				
					};
				}else{
					return res.json({message:"NA"});
				};
			});
		};
	});
};
// *****************************************************************
// Functions
// *****************************************************************
// Create token for native login
function createToken(user){
	return jwt.sign({"email":user,"iss":"gooblu"},config.secret,{ expiresIn: "2 days"});
}
// Express Middleware function for Token verfication
function isAuth(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        var decodedtoken = jwt.decode(bearerToken);
        if(decodedtoken.iss=='gooblu'){
			jwt.verify(bearerToken, config.secret,function(err,decoded){
				if(err){
					res.send(403);
				};
				req.tokeninfo = decodedtoken;
				next();
			});
        }else{
        	res.send(403);
        };
    } else {
        res.send(403);
    }
};