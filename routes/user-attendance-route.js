const router = require("express").Router();
const { userControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router.patch("/:user_uuid/check-in",acl(Permission.ENUM.USER_ATTENDANCE_MANAGEMENT, Action.ENUM.CHECK_IN), userControllers.recordUserCheckIn)
router.patch("/:user_uuid/check-out",acl(Permission.ENUM.USER_ATTENDANCE_MANAGEMENT, Action.ENUM.CHECK_OUT), userControllers.recordUserCheckOut)
router.get("/:user_uuid/attendance",acl(Permission.ENUM.USER_ATTENDANCE_MANAGEMENT, Action.ENUM.READ), userControllers.getUserAttendance)
router.get("/:user_uuid/attendance-report",acl(Permission.ENUM.USER_ATTENDANCE_MANAGEMENT, Action.ENUM.REPORT),userControllers.getAttendanceReportOfUser)

module.exports = router;