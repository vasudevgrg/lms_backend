const router = require("express").Router();
const { organizationControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router
  .route("/:organization_uuid/leave-types")
  .get(acl(Permission.ENUM.ORGANIZATION_LEAVE_MANAGEMENT, Action.ENUM.READ),organizationControllers.getOrganizationLeaveTypes)
  .post(acl(Permission.ENUM.ORGANIZATION_LEAVE_MANAGEMENT, Action.ENUM.CREATE),organizationControllers.addOrganizationLeaveType);

router
  .route("/:organization_uuid/leave-types/:leave_type_uuid")
  .get(acl(Permission.ENUM.ORGANIZATION_LEAVE_MANAGEMENT, Action.ENUM.READ),organizationControllers.getOrganizationLeaveTypeById)
  .put(acl(Permission.ENUM.ORGANIZATION_LEAVE_MANAGEMENT, Action.ENUM.UPDATE),organizationControllers.updateOrganizationLeaveTypeById);

router.get(
  "/:organization_uuid/leave-report",acl(Permission.ENUM.ORGANIZATION_LEAVE_MANAGEMENT, Action.ENUM.REPORT),
  organizationControllers.getOrganizationLeaveReport
);

module.exports = router;