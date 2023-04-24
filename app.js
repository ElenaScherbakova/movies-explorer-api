const { connect } = require("mongoose")
const cors = require("cors")
const express = require("express")
const {
  errors,
} = require("celebrate");
const createError = require("http-errors")
const userRouter = require("./routes/user-router")
const moviesRouter = require("./routes/movies-router")
const { signIn, signUp } = require("./controllers/auth-controller");
const { checkToken } = require("./middlewares/auth");
const { signUpCheck, signInCheck } = require("./celebrate/auth-checks");
const { errorLogger, requestLogger } = require("./middlewares/logger");

const { PORT = 3000, mode } = process.env
let resolve
let reject
connect("mongodb://127.0.0.1:27017/bitfilmsdb", {})
  .then(() => {
    const app = express();
    app.use(cors())
    app.use(express.json())
    if (mode === "production") {
      app.use(requestLogger)
    }
    app.post("/signin", signInCheck, signIn)
    app.post("/signup", signUpCheck, signUp)
    app.use(checkToken)
    app.use("/users/me", userRouter)
    app.use("/movies", moviesRouter)
    app.use((req, res, next) => {
      next(createError(404, "Ресурс не найден"))
    })
    if (mode === "production") {
      app.use(errorLogger)
    }
    app.use(errors())
    app.use((err, req, res, next) => {
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
    })
    resolve(app.listen(PORT, () => {
      console.log(`Express сервер запущен на порту ${PORT}.`)
    }))
  })
  .catch((e) => {
    reject(null)
    console.error("Соединение с mongodb не установленно.")
    console.error(e.message)
  })

module.exports = new Promise((res, rej) => {
  resolve = res
  reject = rej
})
