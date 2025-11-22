// src/auth/googleStrategy.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || null;
    let user = await User.findOne({ 'google.id': profile.id }) || await User.findOne({ email });
    if (!user) {
      user = new User({
        userId: profile.id,
        email,
        name: profile.displayName,
        google: { id: profile.id, provider: 'google' }
      });
      await user.save();
    } else if (!user.google || !user.google.id) {
      // Link google id if user existed with email
      user.google = { id: profile.id, provider: 'google' };
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
//note to self: set up google log in Oauth