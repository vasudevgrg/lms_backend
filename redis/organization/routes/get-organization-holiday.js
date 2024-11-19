const { formatRedisKey } = require("../../../middleware/save-in-redis-middleware");
const { removeUuid, convertToRedisKey } = require("../../common/common-functions");
const HolidayBuilder = require("../../holiday/holiday-builder");
const OrganizationHolidayBuilder = require("../../holiday/organization-holiday-builder");
const OrganizationBuilder = require("../organization-builder");

exports.GetOrganizationsHolidayGetter = async (req, res, next) => {
    const organization_holiday = new OrganizationHolidayBuilder();
    const holiday = new HolidayBuilder();

    organization_holiday.withHoliday(holiday);

    const key = convertToRedisKey(req.originalUrl);
    console.log('key: ', key);
    
    let response = await organization_holiday.getBulkOrganizationHolidays(key);
    if (response && Object.keys(response).length > 0) {
        response = await removeUuid(response);
        return res.send(response);
    }
    next();
}