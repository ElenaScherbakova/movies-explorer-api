module.exports = (err, req, res, next) => {
  if (!res.headersSent) {
    if (err.statusCode > 0) {
      res
        .status(err.statusCode)
        .send({ message: err.message })
    } else {
      res.status(500).send("Непредвиденная ошибка сервера")
    }
    // Eslint-error: Expected to return a value at the end of arrow function  consistent-return
    return null
  }
  // https://expressjs.com/en/guide/error-handling.html
  // So when you add a custom error handler, you must delegate to the default
  // Express error handler, when the headers have already been sent to the client:
  return next(err)
}
