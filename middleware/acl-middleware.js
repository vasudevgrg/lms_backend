// const { redis } = require("../lib/redis-services");
const { UnauthorizedError } = require("./error");
// const redisService = require('../lib/redis-services')

exports.acl = (permission_name,action_name) => {
    return async (req, res, next) => {
        const permissions = req.user.organization_role.role_permissions;
        let hasPermissions = false;

        for (let permission of permissions) {
            if (permission.action.includes(action_name) && permission.permission.value === permission_name) {
                // const storedOutput = await redisService.get(req.originalUrl);
                
                // const storedOutput = await redisService.redis('get',  req.originalUrl);

                // if (storedOutput && Object.keys(storedOutput).length > 0) {
                //     return res.send(storedOutput);
                // }

                hasPermissions = true;
                return next();  
            }
        }
        if (!hasPermissions) return next(new UnauthorizedError('Not validated to perform this action.'));
    }
}