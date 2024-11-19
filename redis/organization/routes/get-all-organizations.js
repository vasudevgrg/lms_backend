const { formatRedisKey } = require("../../../middleware/save-in-redis-middleware");
const { removeUuid } = require("../../common/common-functions");
const OrganizationBuilder = require("../organization-builder");

exports.GetOrganizationsGetter = async (req, res, next) => {
    const organization = new OrganizationBuilder();
     organization.withUsers();
    const key = formatRedisKey(req.originalUrl);
    
    let response = await organization.getBulk(key);
    if (response && Object.keys(response).length > 0) {
        return res.send(response);
    }
    next();
}