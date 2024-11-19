const router = require("express").Router();
const { organizationControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { saveInRedis } = require("../middleware/save-in-redis-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");
const { GetOrganizationsGetter } = require("../redis/organization/routes/get-all-organizations");

router
  .route("/")
  .get(acl(Permission.ENUM.ORGANIZATION_MANAGEMENT, Action.ENUM.READ),organizationControllers.getFilteredOrganization)
  .post(acl(Permission.ENUM.ORGANIZATION_MANAGEMENT, Action.ENUM.CREATE),organizationControllers.createOrganization);

router
  .route("/:organization_uuid")
  .get(acl(Permission.ENUM.ORGANIZATION_MANAGEMENT, Action.ENUM.READ),organizationControllers.getOrganizationById)
  .put(acl(Permission.ENUM.ORGANIZATION_MANAGEMENT, Action.ENUM.UPDATE),organizationControllers.updateOrganization);

router.patch(
  "/:organization_uuid/activate",acl(Permission.ENUM.ORGANIZATION_MANAGEMENT, Action.ENUM.ACTIVATE),
  organizationControllers.activateOrganization
);

router.patch(
  "/:organization_uuid/deactivate",acl(Permission.ENUM.ORGANIZATION_MANAGEMENT, Action.ENUM.DEACTIVATE),
  organizationControllers.deactivateOrganization
);

module.exports = router;
