const { Segments, Joi, celebrate } = require("celebrate");

module.exports = {
  userCheck: celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().email(),
    }),
  }),
}
