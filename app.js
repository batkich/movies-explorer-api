const express = require('express');

require('dotenv').config();

const helmet = require('helmet');

const { NODE_ENV, DATABASE } = process.env;

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const { celebrate, Joi } = require('celebrate');

const { errors } = require('celebrate');

const Notfound = require('./errors/notfound');

const userRout = require('./routs/userRout');

const movieRout = require('./routs/movieRout');

const auth = require('./middlewares/auth');

const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;

const app = express();

const allowedCors = [
  'https://workshop-diploma.nomoreparties.sbs',
  'http://workshop-diploma.nomoreparties.sbs',
  'http://localhost:3030',
  'https://localhost:3030',
];

const {
  userCreate, login,
} = require('./controllers/users');

mongoose.connect(`mongodb://localhost:27017/${NODE_ENV === 'production' ? DATABASE : 'filmsdb'}`);

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
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().required().min(2).max(30),
  }),
}), userCreate);
app.use(auth);
app.use('/users', userRout);
app.use('/movies', movieRout);
app.use('/', () => {
  throw new Notfound('Нет такой страницы');
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
  return next();
});

app.listen(PORT);
