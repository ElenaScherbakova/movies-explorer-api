const { Schema } = require("mongoose");
const validator = require("validator");

const required = (other = {}) => ({
  required: true,
  ...other,
})

const requiredString = (other = {}) => required({
  type: String,
  ...other,
})

const requiredId = (other = {}) => required({
  type: Schema.Types.ObjectId,
  ...other,
})

const requiredLink = (other = {}) => requiredString({
  validate: {
    validator: (value) => validator.isURL(value),
    message: "Значение не является URL",
  },
  ...other,
})

module.exports = {
  required,
  requiredId,
  requiredLink,
  requiredString,
}
