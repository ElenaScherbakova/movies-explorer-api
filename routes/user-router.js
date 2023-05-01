const router = require("express").Router();
const { getMe, updateMe } = require("../controllers/user-controller");
const { userCheck } = require("../celebrate/user-checks");

router.get("/", getMe)
router.patch("/", userCheck, updateMe)

module.exports = router
