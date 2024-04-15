const User = require("./models/User");
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const { compareSync } = require("bcrypt");

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: "Email does not exist" }); }
            if (!compareSync(password, user.password)) { return done(null, false, { message: "Password does not match" }); }
            return done(null, user);
        });
    }
));
//persist user data inside session
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });
