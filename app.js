const cors = require("cors")
const express = require("express")
const { errors } = require("celebrate");
const { connect } = require("mongoose")
const createError = require("http-errors")
const { userRouter, moviesRouter } = require("./routes")
const { signIn, signUp } = require("./controllers/auth-controller");
const { signUpCheck, signInCheck } = require("./celebrate/auth-checks");
const {
  errorLogger, requestLogger, checkToken, errorHandler,
} = require("./middlewares");

const { PORT = 3000, mode, DB_NAME = "bitfilmsdb" } = process.env

let resolve
let reject
connect(`mongodb://127.0.0.1:27017/${DB_NAME}`, {})
  .then(() => {
    const app = express();
    app.use(cors())
    app.use(express.json())
    if (mode === "production") {
      app.use(requestLogger)
    }
    app.post("/signin", signInCheck, signIn)
    app.post("/signup", signUpCheck, signUp)
    app.get("/env", (req, res) => {
      res.send({ ...process.env })
    })
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
    app.use(errorHandler)
    resolve(app.listen(PORT))
  })
  .catch(() => {
    reject(null)
  })

module.exports = new Promise((res, rej) => {
  resolve = res
  reject = rej
})
