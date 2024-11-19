const { removeUuid, formatRedisKey } = require("../../common/common-functions");
const UserBuilder = require("../user-builder")

exports.GetUsersGetter =async (req, res, next ) => {
    const user = new UserBuilder();
    const key = formatRedisKey(req.originalUrl);
    
    let response = await user.getBulk(key);
    if (response && Object.keys(response).length > 0) {
        console.log("output from redis")
        response = await removeUuid(response);
        return res.send(response);
    }
    next();
}