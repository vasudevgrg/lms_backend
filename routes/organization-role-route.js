const router = require("express").Router();
const { organizationControllers } = require("../controllers");
const {acl}  = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");


router
  .route("/:organization_uuid/roles")
  .get(acl(Permission.ENUM.ORGANIZATION_ROLE_MANAGEMENT, Action.ENUM.READ),organizationControllers.getOrganizationRoles)
  .post(acl(Permission.ENUM.ORGANIZATION_ROLE_MANAGEMENT, Action.ENUM.CREATE),organizationControllers.addOrganizationRole);

router.post(
  "/:organization_uuid/roles/bulk",acl(Permission.ENUM.ORGANIZATION_ROLE_MANAGEMENT, Action.ENUM.CREATE),
  organizationControllers.bulkAddOrganizationRoles
);

router
  .route("/:organization_uuid/roles/:role_uuid")
  .get(acl(Permission.ENUM.ORGANIZATION_ROLE_MANAGEMENT, Action.ENUM.READ),organizationControllers.getOrganizationRoleByIds)
  .put(acl(Permission.ENUM.ORGANIZATION_ROLE_MANAGEMENT, Action.ENUM.UPDATE),organizationControllers.updateOrganizationRoleByIds);

router.patch(
  "/:organization_uuid/roles/:role_uuid/activate",acl(Permission.ENUM.ORGANIZATION_ROLE_MANAGEMENT, Action.ENUM.ACTIVATE),
  organizationControllers.activateOrganizationRole
);
router.patch(
  "/:organization_uuid/roles/:role_uuid/deactivate",acl(Permission.ENUM.ORGANIZATION_ROLE_MANAGEMENT, Action.ENUM.DEACTIVATE),
  organizationControllers.deactivateOrganizationRole
);
router.put(
  "/:organization_uuid/roles/:role_uuid/permissions",acl(Permission.ENUM.ORGANIZATION_ROLE_MANAGEMENT, Action.ENUM.UPDATE),
  organizationControllers.updateOrganizationRolePermissions
);

module.exports = router;