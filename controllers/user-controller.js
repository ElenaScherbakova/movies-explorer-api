const createError = require("http-errors")
const errorWrapper = require("./error-wrrapper");
const User = require("../models/user")

/**
 * возвращает информацию о пользователе (email и имя)
 *
 * Обработка ошибок выполнена в errorWrapper.
 */
const getMe = errorWrapper(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password")
  if (user) {
    res.status(200).send(user.toJSON())
  } else {
    throw createError(404, "Пользователь не найден")
  }
})

/**
 * обновляет информацию о пользователе (email и имя)
 *
 * Обработка ошибок выполнена в errorWrapper.
 */
const updateMe = errorWrapper(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, { returnDocument: "after", runValidators: true, context: "query" })
  res.status(200).send(updatedUser)
})

module.exports = {
  getMe,
  updateMe,
}
