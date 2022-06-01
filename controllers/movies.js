const Movie = require('../models/movie');

const BadRequest = require('../errors/badRequest');
const Notfound = require('../errors/notfound');
const Forbidden = require('../errors/forbidden');

const findAllMovies = (req, res, next) => {
  const { _id } = req.user;
  Movie.find({ owner: _id })
    .then((movies) => res.send(movies))
    .catch((err) => next(err));
};

const movieCreate = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then(() => {
      res.send({
        country,
        director,
        duration,
        year,
        description,
        image,
        trailerLink,
        thumbnail,
        owner,
        movieId,
        nameRU,
        nameEN,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') return next(new BadRequest('Переданы некорректные данные'));
      return next(err);
    });
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    .then((card) => {
      if (!card) {
        throw new Notfound('Запрашиваемый фильм не найден');
      }
      if (String(card.owner) !== String(req.user._id)) {
        throw new Forbidden('Нет прав');
      }
      return card.remove()
        .then(() => {
          res.send({
            message: 'Успешно!',
          });
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') return next(new BadRequest('Запрашиваемый фильм не найден'));
      return next(err);
    });
};

module.exports = {
  findAllMovies, movieCreate, deleteMovie,
};
