const router = require("express").Router();
const { actionControllers } = require("../controllers");

router.get("/", actionControllers.getActions)

module.exports = router;