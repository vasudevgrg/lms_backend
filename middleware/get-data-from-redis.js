const redisServices = require("../lib/redis-services");

exports.getDataFromRedis = async (req, res, next )  => {
    const redis_req = await redisServices.redis('get',  req.originalUrl);
    console.log('redis_req: ', redis_req);
    const storedOutput = await this.retrieveData(redis_req);

    if (storedOutput && Object.keys(storedOutput).length > 0) {
        return res.send(storedOutput);
    }
    next();
}

exports.retrieveData=async (redis_key) => {
    console.log('redis_key: ', redis_key);
    // Get all fields of the main object
    const mainObject = await redisServices.redis('hgetall', redis_key);

    for (let key in mainObject) {
        if (typeof mainObject[key] === 'string' && mainObject[key].includes(':') && key != 'created_at'  && key != 'updated_at' && key != 'role_permissions' ) {

            mainObject[key] = await this.retrieveData(mainObject[key]);
        } else {
            try {
                mainObject[key] = JSON.parse(mainObject[key]);
            } catch (e) {
            }
        }
    }

    return mainObject;
}