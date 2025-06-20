const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Configure Passport to use Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract email from profile
          const email = profile.emails[0].value;

          // Check if email is a VIT Bhopal email
          if (!email.endsWith('@vitbhopal.ac.in')) {
            return done(null, false, { 
              message: 'Only VIT Bhopal email addresses are allowed to register.' 
            });
          }

          // Check if user already exists
          let user = await User.findOne({ where: { email } });

          // If user exists, return the user
          if (user) {
            return done(null, user);
          }

          // Create a new user with Google data
          const name = profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`;
          
          // Generate a random password for the user
          const randomPassword = crypto.randomBytes(16).toString('hex');
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(randomPassword, salt);

          // Create the user
          user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'hosteller', // Default role, user can update later
            isVerified: true, // Auto-verify since Google account is already verified
            profilePicture: profile.photos[0]?.value || null,
            provider: 'google',
            googleId: profile.id,
            isProfileComplete: false // Require them to complete their profile
          });

          return done(null, user);
        } catch (error) {
          console.error('Google auth error:', error);
          return done(error);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth credentials not found. Google sign-in will not be available.');
}

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
