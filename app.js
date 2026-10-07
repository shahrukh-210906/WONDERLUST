require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo')
const flash = require('connect-flash');
const listingsRoutes = require('./routes/listing.js');
const reviewsRoutes = require('./routes/review.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const userRoutes = require('./routes/user.js');
const bookingRoutes = require('./routes/booking.js');
const wishlistRoutes = require('./routes/wishlist.js');

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '5m' }));
app.locals.imageUrl = require('./utils/imageUrl');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const dbURL = process.env.ATLASDB_URL;
const requiredEnv = ['ATLASDB_URL', 'SECRET', 'CLOUD_NAME', 'CLOUD_API_KEY', 'CLOUD_API_SECRET'];
const missingEnv = requiredEnv.filter(name => !process.env[name]?.trim());
if (missingEnv.length) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.get('/health', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'unavailable' });
});

// Add this middleware for CSP
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; img-src 'self' https://images.unsplash.com https://plus.unsplash.com https://res.cloudinary.com data:; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; connect-src 'self';"
  );
  next();
});

const mongoose = require('mongoose');

const store = MongoStore.create({
  clientPromise: mongoose.connection.asPromise().then(connection => connection.getClient()),
  crypto:{
    secret: process.env.SECRET
  },
  touchAfter: 24*3600
});

store.on('error', (err)=> {
  console.error('Session store error:', err.code || err.name);
})
// connect-mongo initializes its collection asynchronously.
store.collectionP?.catch(err => store.emit('error', err));

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // Reading an absent flash message creates session data and a database write.
    res.locals.success = req.session?.flash?.success?.length ? req.flash('success') : [];
    res.locals.error = req.session?.flash?.error?.length ? req.flash('error') : [];
    // Passport has already fetched the authenticated user, including wishlist IDs.
    res.locals.currUser = req.user || null;
    next();
});




app.use('/listings', listingsRoutes);
app.use('/listings/:id/reviews', reviewsRoutes);
app.use('/listings/:id/book', bookingRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/', userRoutes);

//localhost route
app.get('/', (req, res) => {
  res.render('home.ejs');
});

// Example route: /listings/search?q=paris



app.use((req, res, next) => next(new (require('./utils/ExpressError'))(404, 'Page not found')));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const { status = 500, message = 'Something went wrong' } = err;
  res.status(status).render('listings/error', { message });
});

async function start() {
  try {
    await mongoose.connect(dbURL, { serverSelectionTimeoutMS: 10000 });
    await store.collectionP;
    console.log('Connected to MongoDB');
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`Server is listening on port ${port}`);
    });
    server.on('error', async (err) => {
      console.error('Server failed to start:', err.code || err.name);
      await mongoose.disconnect();
      process.exitCode = 1;
    });
  } catch (err) {
    console.error('Database connection failed. Check ATLASDB_URL and Atlas network access.', err.code || err.name);
    await mongoose.disconnect();
    process.exitCode = 1;
  }
}

if (require.main === module) start();
module.exports = app;
