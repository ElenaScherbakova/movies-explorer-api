const validator = require("validator");
const { Schema, model } = require("mongoose")
const { requiredString } = require("./types");

/**
 * name     — имя пользователя, например: Александр или Мария.
 *            Это обязательное поле-строка от 2 до 30 символов.
 * email    — почта пользователя, по которой он регистрируется.
 *            Это обязательное поле, уникальное для каждого пользователя.
 *            Также оно должно валидироваться на соответствие схеме электронной почты.
 * password — хеш пароля. Обязательное поле-строка. Нужно задать поведение по умолчанию,
 *            чтобы база данных не возвращала это поле.
 * */
const userSchema = new Schema({
  name: requiredString({
    maxLength: 30,
    minLength: 2,
  }),
  email: requiredString({
    unique: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: "Неправильный формат email.",
    },
  }),
  password: requiredString({ select: false }),
})

module.exports = model("user", userSchema)
