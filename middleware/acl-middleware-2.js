const aclConfig = require('../acl-config');
const redisService = require('../lib/redis-services')

// Middleware to validate permissions and actions
const pathToRegexp = (route) => {
    return new RegExp('^' + route.replace(/:\w+/g, '[\\w-]+') + '$');
};

async function aclMiddleware(req, res, next) {
    const method = req.method; 
    const path = req.path; 
    console.log('path: ', path);
    const routes = aclConfig.routes; 
    
    for (const route in routes) {
        if (pathToRegexp(route).test(path)) {
            if (routes[route][method]) {
                const action = routes[route][method].action;
                const permission = routes[route][method].permission;

                if (validateUserPermission(req.user, permission, action)) {
                    // const storedOutput = await redisService.redis('get', path);
                    // if (storedOutput) {return res.send(storedOutput)};
                    return next(); 
                } else {
                    return res.status(403).json({ error: "Forbidden: You don't have the required permission." });
                }
            } else {
                return res.status(405).json({ error: "Method not allowed." });
            }
        }
    }
    
    return res.status(404).json({ error: "Route not found." });
}

async function validateUserPermission(user, permission_name, action_name) {
    const permissions = user.organization_role.role_permissions;
    let hasPermissions = false;

    for (let permission of permissions) {
        if (permission.action.includes(action_name) && permission.permission.name === permission_name) {
            hasPermissions = true;
            break;
        }
    }

    if (!hasPermissions) return false;
    return true;
    
}

module.exports = aclMiddleware;
