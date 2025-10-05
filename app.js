require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
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
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const dbURL = process.env.ATLASDB_URL;

// Add this middleware for CSP
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; img-src 'self' https://images.unsplash.com https://res.cloudinary.com/dwb3maypk/ data:; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; connect-src 'self' http://localhost:3000;"
  );
  next();
});

const mongoose = require('mongoose');

main().then(() => {
    console.log("Connected to MongoDB");
}).catch(err => console.log(err));

async function main(){
    mongoose.connect(dbURL);
}

const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto:{
    secret: process.env.SECRET
  },
  touchAfter: 24*3600
});

store.on('error', ()=> {
  console.log("ERROR IN MONGO STORE", err)
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
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

app.use(async (req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    if (req.user) {
        // Fetch the full user object with the wishlist populated
        res.locals.currUser = await User.findById(req.user._id).populate('wishlist');
    } else {
        res.locals.currUser = null;
    }
    next();
});

app.get ('/fakeUser', async (req, res) => {
    const user = new User({ email: 'fakeuser@example.com', username: 'fakeuser', password: 'password' });
    const registeredUser = await User.register(user, 'password');
    res.send(registeredUser);
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



app.use((err, req, res, next) => {
  const { status = 500, message = 'Something went wrong' } = err;
  res.status(status).render('listings/error', { message });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});