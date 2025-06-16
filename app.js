const createError = require('http-errors'); // Jangan lupa import createError
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session'); // Tambahkan ini
const flash = require('connect-flash');     // Tambahkan ini

const indexRouter = require('./routes/index');
const penggunaRouter = require('./routes/pengguna'); // Tambahkan ini!
const rapatRouter = require('./routes/rapat');       // Tambahkan ini!
const authRouter = require('./routes/auth'); // Tambahkan ini

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
  secret: 'your_secret_key_here', // Ganti dengan string acak yang kuat
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // Perpanjang durasi session menjadi 1 jam
}));
app.use(flash());

// Middleware untuk membuat pesan flash tersedia di view
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/pengguna', penggunaRouter); // Gunakan router pengguna
app.use('/rapat', rapatRouter);         // Gunakan router rapat
app.use('/', authRouter); // Tambahkan ini untuk menghubungkan rute auth

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;