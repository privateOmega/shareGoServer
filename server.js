// Dependencies
const express               = require('express');
const compression           = require('compression');
const session               = require('express-session');
const app                   = express();
const apiRoutes             = express.Router();
const MongoStore            = require('connect-mongo')(session);
const bodyParser            = require('body-parser');
const morgan                = require('morgan');
const mongoose              = require('mongoose');
const jwt                   = require('jsonwebtoken');
const errorHandler          = require('errorhandler');
const passport              = require('passport');
const expressValidator      = require('express-validator');
const expressStatusMonitor  = require('express-status-monitor');
const multer                = require('multer');
const bcrypt                = require('bcrypt-nodejs');
const nodemailer            = require('nodemailer');
// Configurations
const config                = require('./app/configurations/config');
const port                  = process.env.PORT || 8080;
// Controllers
const userController        = require('./app/controllers/user');
const tripController        = require('./app/controllers/trip');

// Mongo connect statements
mongoose.Promise            = global.Promise;
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
mongoose.connect(config.database);
mongoose.connection.on('error', () => {
  console.log('MongoDB connection error. Please make sure MongoDB is running.');
  //process.exit();
});

// App Configurations
app.set('superSecret', config.secret);
app.use(bodyParser.urlencoded({ extended: true   })); // Get info from URL parameters
app.use(bodyParser.json());
app.use(morgan('dev')); // Log requests to the console
app.use(expressStatusMonitor()); // Log server status
app.use(compression());
app.use(expressValidator());
app.use(errorHandler());
/*app.use(function(req,res){
  console.log(req.headers); 
});*/
// App Routes
app.post('/login',userController.postLogin);
app.post('/signup', userController.postSignup);
app.post('/forgot', userController.forgot);
app.use('/logged/', apiRoutes);
apiRoutes.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  }else {
    return res.status(403).send({ success: false, message: 'No token provided.'});
  }
});

// API ROUTES
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

apiRoutes.get('/logout', userController.logout);
apiRoutes.post('/profile', userController.getProfile);
apiRoutes.post('/updateAccount', userController.postUpdateProfile);
apiRoutes.post('/getBlock', userController.getBlockedList);
apiRoutes.post('/unBlock', userController.unBlockUser);
apiRoutes.post('/newTrip', tripController.createTrip);

//app.post('/reset/:token', userController.postReset);


//apiRoutes.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
//apiRoutes.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
//apiRoutes.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);


// start the server
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
console.log('Press CTRL-C to stop\n');
