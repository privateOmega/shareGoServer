const jwt                   = require('jsonwebtoken');
const userCredentials       = require('../models/userCredentials');
const config                = require('../configurations/config');
const nodemailer            = require('nodemailer');
const crypto                = require('crypto');
const async                 = require('async');
const user                  = require('../models/user');
const block                 = require('../models/block');
const moment                = require('moment');
const http                  = require('http');
const smtpTransport         = require('nodemailer-smtp-transport');
const rating                  = require('../models/rating');

exports.postLogin = (req, res, next) => {
  req.assert('username', 'Username is not valid').notEmpty();
  req.assert('password', 'Password cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false, message: errors });
  }
  userCredentials.findOne( { username: req.body.username }, function(err, user) {
    if (err)
      throw err;
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      user.comparePassword(req.body.password, function(err, isMatch) {
            if (err) throw err;
            if(!isMatch){
              console.log("Auth failed at backend");
              res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            }
            else{
              console.log("Auth sucessful at backend");
              var token = jwt.sign(user, config.secret, {
              expiresIn: 60*60*24 // expires in 24 hours
              });
              res.json({ success: true, token: token });
            }
      });
    }
  });
};

exports.logout = (req, res) => {
  req.logout();
  console.log("Logged out");
};

// Signup
exports.postSignup = (req, res, next) => {
  req.sanitize('email').normalizeEmail({ remove_dots: false });
  console.log("Reqest"+req.body.username+req.body.dob+req.body.gender);
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false, message: errors });
  }
  var User = new user({
    username:req.body.username,
    email: req.body.email,
    name:req.body.name,
    gender:req.body.gender,
    number:parseInt(req.body.number),
    dob:req.body.dob,
    aadharno:parseInt(req.body.aadharno),
    state:req.body.state,
    city:req.body.city,
    pincode:parseInt(req.body.pincode),
    points:500
  });

  var UserCredentials = new userCredentials({
    username:req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  var Rating = new rating({
    user: req.body.username,

  })
  user.find({username:req.body.username},function(error,existingUser){
    if(existingUser.length){
      console.log("user exists");
      /*res.writeHead(200, {"Content-Type": "application/json"});
      //res.json({ success: false});
      console.log(existingUser.username);
      if (existingUser.username == req.body.username) {
        console.log("username exists");
        res.write(JSON.stringify({rUname: 'Account with that username already exists' }));
        return ;
      }
      else if (existingUser.email==req.body.email) {
        console.log("email exists");
        res.write(JSON.stringify({ rEmail: 'Account with that email already exists' }));
        return ;
      }
      else if (existingUser.aadharno==req.body.aadharno){
        console.log("aadhar exists");
        res.write(JSON.stringify({ rAadhar: 'Account with that aadhaar number already exists' }));
        return ;
      }
      res.write(JSON.stringify({ success: false }));
      res.end();*/
      res.json({success: false}); 
    }
    else{
      console.log("user doesnt exist");
      User.save((err) => {
        if (err) {
          console.log(err);
          return next(err); }
      });
      UserCredentials.save((err) => {
        if (err) { return next(err); }
      });
      Rating.save((err) =>{
        if(err) { return next(err);}
      });
      res.json({ success: true, message: 'Account saved' });
      }
      return;
  }); 
};

exports.forgot = (req, res) => {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
  },
  function(token, done) {
      userCredentials.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          res.json({ success: false, message: 'No Account with that email address exists.' });
          return ;
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport(smtpTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: 'sharegoproj@gmail.com',
          pass: 'sharego12345'
        }
      }));
      var mailOptions = {
        to: user.email,
        from: 'sharegoproj@gmail.com',
        subject: 'shareGO Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        res.json({ success: true, message: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) console.log(err);
  });
};

exports.sos = (req, res) => {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
  },
  function(token, done) {
      user.findOne({ username: req.body.user }, function(err, user) {
        if (!user) {
          res.json({ success: false, message: 'No Account with that email address exists.' });
          return ;
        }
        console.log('user found');
        done(err,token,user);
      });

    },
    function(token, user, done) {
      console.log("ivide ethi");
      var transporter = nodemailer.createTransport(smtpTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: 'sharegoproj@gmail.com',
          pass: 'sharego12345'
        }
      }));
      var mailOptions = {
        to: 'policeofsharego@gmail.com',
        from: 'sharegoproj@gmail.com',
        subject: 'SOS',
        text: 'You are receiving this because '+user.name+' , user of Sharego application has requested for your immediate assistance.\n\n' +
          'Her given contact number is '+user.number+'.'+'Her last known gps location is ('+req.body.latitude+' , '+req.body.longitude+' ). Please ignore this email if you have already recived this email.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        res.json({ success: true, message: 'An e-mail has been sent to police with further instructions.' });
        done(err, 'done');
      });
      //res.json({success:true});
    }
  ], function(err) {
    if (err) console.log(err);
  });
};

exports.getProfile = (req,res,next) =>{
  console.log(req.body.username);
  req.assert('username', 'Please enter a valid username.').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.json({ success: false, message: 'enter a valid username' });
  }
  user.findOne({ username: req.body.username }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      rating.findOne({user:existingUser.username}, (err, rating) => {
        if (err) { return next(err); }
        if (rating) {
        res.json({
          success: true,
          username: existingUser.username,
          email: existingUser.email,
          gender: existingUser.gender,
          number: existingUser.number,
          dob: existingUser.dob,
          state: existingUser.state,
          city: existingUser.city,
          pincode :existingUser.pincode,
          points :existingUser.points,
          paxRating:rating.paxRating,
          driverRating:rating.driverRating
        });
      }
      else{
        console.log("No user in rating table");
        res.json({success:false});
      }
    });
    }
    else
      res.json({success: false,message: 'no existing user'});
  });
};

exports.postUpdateProfile = (req, res, next) => {
  req.assert('username', 'Please enter a valid username.').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.json({ success: false, message: 'enter a valid username' });
  }

  user.findOne({username: req.body.username}, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || '';
    user.password = req.body.password || '';
    user.gender = req.body.gender || '';
    user.number = req.body.number || '';
    user.state = req.body.state || '';
    user.city = req.body.city || '';
    user.state = req.body.state || '';
    user.pincode = req.body.pincode || '';

    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          return res.json({ success: false, message: 'Email address you have entered is already associated with an account.' });
        }
        return next(err);
      }
      res.json({ success: true, message: 'Profile successfully updated.' });
    });
  });
};

exports.getBlockedList  = (req,res,next) =>{
  console.log(req.body.username);
  req.assert('username', 'Please enter a valid username.').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.json({ success: false, message: 'enter a valid username' });
  }
  res.writeHead(200, {"Content-Type": "application/json"});
  block.find ({by:req.body.username}).cursor().on('data', function(existingUser){
    if (existingUser) {
      console.log("User"+existingUser.user+" time "+existingUser.time);
      res.write(JSON.stringify({name: existingUser.user}));
    }
  });
  res.end();
};

exports.unBlockUser = (req, res, next) => {
  req.assert('username', 'Please enter a valid user.').notEmpty();
  req.assert('blockedUser', 'Please enter a valid blocked user.').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.json({ success: false, message: 'enter a valid username' });
  }
  block.findOneAndRemove({$and:[{by: req.body.username},{user:req.body.blockedUser}]}).cursor()
  .on('data', function(existingUser){
    res.json({ success: true, message: 'Unblocked Successfully.' });
  });
};