const router = require("express").Router();
const { userControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { saveInRedis } = require("../middleware/save-in-redis-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");
const { redisSetter } = require("../redis/common/redis-setter");
const { GetUserByIdGetter } = require("../redis/user/routes/get-user-by-id");
const { GetUsersGetter } = require("../redis/user/routes/get-users");

router.route("/")
    .post(acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.CREATE), userControllers.createUser)
    .get(acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.READ),userControllers.getFilteredUsers)

router.post("/verify", userControllers.verifyUser)

router.route("/:user_uuid")
    .get(acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.READ),
    userControllers.getUserById)
    .put(acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.UPDATE),userControllers.updateUserById)

router.route('/:user_uuid/personal-details').put(acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.UPDATE),userControllers.updateUserPersonalDetails)
router.patch("/:user_uuid/activate", acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.CREATE),userControllers.activateUser)
router.patch("/:user_uuid/deactivate", acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.CREATE),userControllers.deactivateUser)
router.put("/:user_uuid/password", acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.CREATE),userControllers.updatePassword)

module.exports = router;