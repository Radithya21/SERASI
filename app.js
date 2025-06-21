const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');

const penggunaRouter = require('./routes/pengguna'); 
const rapatRouter = require('./routes/rapat');       
const authRouter = require('./routes/auth'); 

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Konfigurasi session dan flash
app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } 
}));
app.use(flash());

// Middleware untuk membuat pesan flash tersedia di view
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Halaman utama yang mengarah ke login
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.use('/pengguna', penggunaRouter); // Gunakan router pengguna
app.use('/rapat', rapatRouter);         // Gunakan router rapat
app.use('/', authRouter); // Menghubungkan rute auth

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
