const { Segments, Joi, celebrate } = require("celebrate");
const validator = require("validator");
const { joiIdValidator } = require("../utils")

const linkValidator = Joi.string().required().custom((value, helper) => (validator.isURL(value)
  ? value
  : helper.message({ custom: "Неправильный URL" })))

module.exports = {

  createMovieCheck: celebrate({
    [Segments.BODY]: Joi.object().keys({
      year: Joi.string().required().length(4),
      image: linkValidator,
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required().min(0),
      thumbnail: linkValidator,
      description: Joi.string().required(),
      trailerLink: linkValidator,
    }),
  }),

  deleteMovieCheck: celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      movieId: Joi.custom(joiIdValidator),
    }),
  }),

}
