const jwt = require("jsonwebtoken");
const createError = require("http-errors")

const { NODE_ENV, JWT_SECRET = NODE_ENV !== "production" ? "dev-secret" : null } = process.env

if (NODE_ENV === "production" && !JWT_SECRET) {
  throw new Error("JWT_SECRET отсутсвует.")
}
const checkToken = (req, res, next) => {
  let success = false
  const { authorization = "" } = req.headers;
  const token = authorization.startsWith("Bearer ")
    ? authorization.replace("Bearer ", "")
    : null

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET)
      success = true
    } catch (err) {
      // Ignore
    }
  }

  if (success) next()
  else next(createError(401, "Необходима авторизация"))
}

module.exports = { checkToken, JWT_SECRET }
