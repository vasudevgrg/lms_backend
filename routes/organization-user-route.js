const router = require("express").Router();
const { organizationControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router
  .route("/:organization_uuid/users")
  .get(acl(Permission.ENUM.ORGANIZATION_USER_MANAGEMENT, Action.ENUM.READ),organizationControllers.getOrganizationUsers)
  .post(acl(Permission.ENUM.ORGANIZATION_USER_MANAGEMENT, Action.ENUM.CREATE),organizationControllers.addOrganizationUser);

router
  .route("/:organization_uuid/users/:user_uuid")
  .get(acl(Permission.ENUM.ORGANIZATION_USER_MANAGEMENT, Action.ENUM.READ),organizationControllers.getOrganizationUserById)
  .put(acl(Permission.ENUM.ORGANIZATION_USER_MANAGEMENT, Action.ENUM.UPDATE),organizationControllers.updateOrganizationUserById);

  module.exports = router;