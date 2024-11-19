const router = require("express").Router();
const { departmentControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router.route("/")
    .get(acl(Permission.ENUM.DEPARTMENT_MANAGEMENT, Action.ENUM.READ),departmentControllers.getFilteredDepartments)
    .post(acl(Permission.ENUM.DEPARTMENT_MANAGEMENT, Action.ENUM.CREATE),departmentControllers.createDepartment)

router.route("/:department_uuid")
    .get(acl(Permission.ENUM.DEPARTMENT_MANAGEMENT, Action.ENUM.READ),departmentControllers.getDepartmentById)
    .put(acl(Permission.ENUM.DEPARTMENT_MANAGEMENT, Action.ENUM.UPDATE),departmentControllers.updateDepartment)

router.patch("/:department_uuid/activate",acl(Permission.ENUM.DEPARTMENT_MANAGEMENT, Action.ENUM.ACTIVATE), departmentControllers.activateDepartment)

router.patch("/:department_uuid/deactivate", acl(Permission.ENUM.DEPARTMENT_MANAGEMENT, Action.ENUM.DEACTIVATE),departmentControllers.deactivateDepartment)

module.exports = router;