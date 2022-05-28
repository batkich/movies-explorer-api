const userRout = require('express').Router();

const { celebrate, Joi } = require('celebrate');

const {
  updateProfile, selectedUser,
} = require('../controllers/users');

userRout.get('/me', selectedUser);
userRout.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().min(2).max(30),
  }),
}), updateProfile);

module.exports = userRout;
