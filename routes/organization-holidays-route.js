const router = require("express").Router();
const { organizationControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { saveInRedis } = require("../middleware/save-in-redis-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");
const { GetOrganizationsHolidayGetter } = require("../redis/organization/routes/get-organization-holiday");

router
  .route("/:organization_uuid/holidays")
  .get(acl(Permission.ENUM.ORGANIZATION_HOLIDAY_MANAGEMENT, Action.ENUM.READ), organizationControllers.getFilteredOrganizationHoliday)
  .post(acl(Permission.ENUM.ORGANIZATION_HOLIDAY_MANAGEMENT, Action.ENUM.CREATE),organizationControllers.createOrganizationHoliday)

router.post("/:organization_uuid/holidays/bulk", acl(Permission.ENUM.ORGANIZATION_HOLIDAY_MANAGEMENT, Action.ENUM.CREATE_BULK),organizationControllers.bulkCreateOrganizationHolidays);  

router.patch(
  "/:organization_uuid/holidays/:holiday_uuid/activate",acl(Permission.ENUM.ORGANIZATION_HOLIDAY_MANAGEMENT, Action.ENUM.ACTIVATE),
  organizationControllers.activateOrganizationHoliday
);
router.patch(
  "/:organization_uuid/holidays/:holiday_uuid/deactivate",acl(Permission.ENUM.ORGANIZATION_HOLIDAY_MANAGEMENT, Action.ENUM.DEACTIVATE),
  organizationControllers.deactivateOrganizationHoliday
);

module.exports = router;
