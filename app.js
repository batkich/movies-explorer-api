const express = require('express');

require('dotenv').config();

const helmet = require('helmet');

const { NODE_ENV, DATABASE } = process.env;

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const { errors } = require('celebrate');

// const Notfound = require('./errors/notfound');

// const auth = require('./middlewares/auth');

const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;

const app = express();

const allowedCors = [
  'https://workshop-diploma.nomoreparties.sbs',
  'http://workshop-diploma.nomoreparties.sbs',
  'http://localhost:3000',
  'https://localhost:3000',
];

mongoose.connect(NODE_ENV === 'production' ? DATABASE : 'mongodb://localhost:27017/filmsdb');
app.use((req, res, next) => {
  const { origin } = req.headers;

  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  const { method } = req;
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const requestHeaders = req.headers['access-control-request-headers'];
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    return res.end();
  }

  return next();
});

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(require('./routs/index'));
// app.use(require('./routs/authRout'));

// app.use(auth);
// app.use(require('./routs/userRout'));
// app.use(require('./routs/movieRout'));

// app.use('/', () => {
//   throw new Notfound('Нет такой страницы');
// });

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
  return next();
});

app.listen(PORT);
