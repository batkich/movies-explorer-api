const indexRout = require('express').Router();
const auth = require('../middlewares/auth');
const Notfound = require('../errors/notfound');

indexRout.use(require('./authRout'));

indexRout.use(auth);
indexRout.use(require('./userRout'));
indexRout.use(require('./movieRout'));

indexRout.use('/', () => {
  throw new Notfound('Нет такой страницы');
});

module.exports = indexRout;
