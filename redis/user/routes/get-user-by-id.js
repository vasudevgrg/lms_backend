const { formatRedisKey } = require("../../../middleware/save-in-redis-middleware");
const { convertToRedisKey } = require("../../common/common-functions");
const  OrganizationBuilder  = require("../../organization/organization-builder");
const OrganizationRoleBuilder = require("../../organization_role/organization-role-builder");
const RoleBuilder = require("../../role/role-builder");
const UserBuilder = require("../user-builder");

exports.GetUserByIdGetter = async (req, res, next) => {
    const user = new UserBuilder()
    const organization = new OrganizationBuilder();
    const organization_role = new OrganizationRoleBuilder();
    const role = new RoleBuilder();

    user.withOrganization(organization);
    organization_role.withRole(role);
    user.withOrganizationRole(organization_role);

    const key = convertToRedisKey(req.originalUrl);

    const response = await user.get(key);
    console.log('response: ', response);
    if (response && Object.keys(response).length > 0 && !Object.values(response).includes(null)) {
        console.log("output from redis");
        return res.send(response);
    }
    next();
}