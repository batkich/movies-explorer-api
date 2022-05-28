const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const BadRequest = require('../errors/badRequest');
const Unauthorized = require('../errors/unauthorized');
const Notfound = require('../errors/notfound');
const Conflict = require('../errors/conflict');

const userCreate = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name,
    }))
    .then((user) => {
      const newUser = {
        email: user.email, name: user.name,
      };
      res.send({
        newUser,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') return next(new BadRequest('Переданы некорректные данные'));
      if (err.code === 11000) return next(new Conflict('Email уже используется'));
      return next(err);
    });
};

const updateProfile = (req, res, next) => {
  const { email, name } = req.body;
  const currentUser = req.user._id;
  const reqEmail = email;
  const reqName = name;

  User.findByIdAndUpdate(currentUser, {
    email, name,
  }, { runValidators: true, new: true })
    .then((user) => {
      if (!req.user) {
        throw new BadRequest('Переданы некорректные данные');
      }
      if (!reqEmail || !reqName) {
        throw new BadRequest('Переданы некорректные данные');
      }
      const {
        _id,
      } = user;
      res.send({
        email, name, _id,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') return next(new BadRequest('Переданы некорректные данные'));
      if (err.name === 'CastError') return next(new BadRequest('Переданы некорректные данные'));
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'topsecret-token',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(() => {
      next(new Unauthorized('Авторизация неуспешна, проверьте логин или пароль'));
    });
};

const selectedUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new Notfound('Запрашиваемый пользователь не найден');
      }
      const {
        _id, email, name,
      } = user;
      res.send({
        name, email, _id,
      });
    })
    .catch((err) => {
      if (err.name === 'CastError') return next(new BadRequest('Запрашиваемый пользователь не найден'));
      return next(err);
    });
};

module.exports = {
  userCreate, updateProfile, login, selectedUser,
};
