const router = require("express").Router();
const { permissionControllers } = require("../controllers");

router.get("/", permissionControllers.getAllPermissions)

module.exports = router;