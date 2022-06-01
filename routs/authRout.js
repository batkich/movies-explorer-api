const authRout = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  userCreate, login,
} = require('../controllers/users');

authRout.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
authRout.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().required().min(2).max(30),
  }),
}), userCreate);

module.exports = authRout;
