module.exports = {
    redis: async function() {
        let numberOfArgs = arguments.length;
        let redisCommand = arguments[0];
        let argsArr = [];

        for(let index = 1; index < numberOfArgs - 1; index++) {
            argsArr.push(arguments[index]);
        }

        if(typeof (arguments[ numberOfArgs - 1]) === "function") {
            let callBack = arguments[numberOfArgs - 1];
            argsArr.push( function(err, result) {
                if (result && redisCommand === "hgetall" && typeof(result) === "object" && Object.keys(result).length == 0 )      result = null;
                callBack(err, result);
            })
        }else {
            argsArr.push( arguments[numberOfArgs - 1]); 
        }

        return global.redisClient[redisCommand].apply(global.redisClient, argsArr);
    }
}

// const Redis = require("ioredis");
// const redis = new Redis();

// class RedisService {
//     add = async (key, value) => {
//         await redis.set(key, value, 'EX', 60);
//     };

//     get = async (key) => {
//         const otp = await redis.get(key);
//         return otp;
//     };
// }

// module.exports = new RedisService()