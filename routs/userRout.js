const userRout = require('express').Router();

const { celebrate, Joi } = require('celebrate');

const {
  updateProfile, selectedUser,
} = require('../controllers/users');

userRout.get('/users/me', selectedUser);
userRout.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
  }),
}), updateProfile);

module.exports = userRout;
