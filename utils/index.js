const { Types } = require("mongoose");

const joiIdValidator = (value, helper) => (Types.ObjectId.isValid(value)
  ? value
  : helper.message({ custom: "Неверный id" }))

module.exports = {
  joiIdValidator,
}
