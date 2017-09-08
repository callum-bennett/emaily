const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const mongoose = require('mongoose');
const keys = require('./../config/keys');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(
  async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    }
    catch (e) {
      console.log('Unable to deserialize user: ', id)
    }
  }
);

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        } else {
          const user = await new User({ googleId: profile.id }).save();
          done(null, user);
        }
      } catch(e) {
        console.log('Failed to authenticate: ', e);
      }
    }
  )
);
