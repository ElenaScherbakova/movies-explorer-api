const { Segments, Joi, celebrate } = require("celebrate");

module.exports = {

  signUpCheck: celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().email(),
      password: Joi.string(),
    }),
  }),

  signInCheck: celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),

}
