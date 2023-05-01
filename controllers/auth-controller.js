const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const createError = require("http-errors");
const errorWrapper = require("./error-wrrapper")
const User = require("../models/user");
const { JWT_SECRET } = require("../middlewares/auth");

/**
 * проверяет переданные в теле почту и пароль.
 * Возвращает token которым пользователь может подписывать запросы.
 *
 * Обработка ошибок выполнена в errorWrapper.
 */
const signIn = errorWrapper(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email }).select("+password")
  if (user) {
    const value = await bcrypt.compare(password, user.password)
    if (value) {
      res.status(200).send({
        token: jwt.sign({ _id: user._id }, JWT_SECRET),
      })
      return
    }
  }
  throw createError(401, "Не правильный логин или пароль")
})

/**
 * создаёт пользователя с переданными в теле.
 *
 * Обработка ошибок выполнена в errorWrapper.
 */
const signUp = errorWrapper(async (req, res) => {
  try {
    const {
      body: {
        name, avatar, about, email, password,
      },
    } = req
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name, avatar, about, email, password: hash,
    })
    const userWithoutPassword = user.toJSON()
    delete userWithoutPassword.password
    res.status(201).send(userWithoutPassword)
  } catch (e) {
    const error = e.code === 11000
      ? createError(409, "Пользователь с таким email уже зарегистрирован")
      : createError(e)
    throw error
  }
})

module.exports = {
  signIn,
  signUp,
}
