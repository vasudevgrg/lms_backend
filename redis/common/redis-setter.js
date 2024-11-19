var pluralize = require('pluralize');
const redisServices = require('../../lib/redis-services');
const { formatRedisKey, convertToRedisKey } = require('./common-functions');


exports.redisSetter = async (req, res, next) => {
    const originalSend = res.send.bind(res);

    res.send = async (body) => {
        redis_key = this.convertToRedisKey(req.originalUrl);
        console.log('redis_key: ', redis_key);

        // await redisServices.redis('set', key, redis_key);
        await this.saveData(body, redis_key);

        originalSend(body);
    };

    next();
};

exports.saveInRedis = async (data, key) => {
    const redis_key = convertToRedisKey(key);

    return this.saveData(data, redis_key);
}

exports.saveData = async (object, redis_key) => {

    if (typeof object === 'string') object = JSON.parse(object);

    for (let key in object) {
        if (Array.isArray(object[key])) {
            let store_key = [];
            await object[key].map(async e => {
                if (e.uuid || e.user_id) {
                    const r_key = e.uuid ? `${e.uuid}` : `${e.user_id}`;

                    store_key.push(r_key);
                    await this.saveData(e, r_key);
                };
            });
            store_key.length > 0 ? await redisServices.redis('hset', redis_key, key, JSON.stringify(store_key)) :
                await redisServices.redis('hset', redis_key, key, JSON.stringify(object[key]));
            continue;
        }

        if (typeof object[key] !== 'object') {

            await redisServices.redis('hset', redis_key, key, object[key]);
        } else if (object[key] !== null) {

            const uuid = object[key].uuid ? `${object[key].uuid}` : `${object[key].user_id}`;

            if (uuid != "undefined") {
                await redisServices.redis('hset', redis_key, key, uuid);
                await this.saveData(object[key], uuid)
            }
            else {
                await redisServices.redis('hset', redis_key, key, JSON.stringify(object[key]));
            }
        }
    }
}

// async function saveData(payload, redis_key) {

//     if (typeof payload === 'string') payload = JSON.parse(payload);

   

//     for (let key in payload) {
//         if(Array.isArray(payload[key])) {
//             let store_key = [];
//             await payload[key].map(async e => {
//                 if(e.uuid || e.user_id) {
//                     const r_key = e.uuid? `${e.uuid}`: `${e.user_id}`;

//                     store_key.push(r_key);
//                     await saveData(e, r_key);
//                 };
//             });
//             store_key.length >0 ? await redisServices.redis('hset', redis_key, key, JSON.stringify(store_key)):await redisServices.redis('hset', redis_key, key, JSON.stringify(payload[key]));            
//             continue;
//         }

//         if (typeof payload[key] !== 'object') {
//             // const value = Array.isArray(payload[key]) ? JSON.stringify(payload[key]) : payload[key];
            
//             await redisServices.redis('hset', redis_key, key,JSON.parse( payload[key]));
//         } else if (payload[key] !== null) {

//             // const nestedKey = `${pluralize( key)}:${payload[key].uuid}`;
//             // await redisServices.redis('hset', redis_key, key, nestedKey);

//             await saveData(payload[key], nestedKey);
//         }
//     }
// }\


// async function saveData(object, redis_key) {

//     if (typeof object === 'string') object = JSON.parse(object);



//     for (let key in object) {
//         if (Array.isArray(object[key])) {
//             let store_key = [];
//             await object[key].map(async e => {
//                 if (e.uuid || e.user_id) {
//                     const r_key = e.uuid ? `${e.uuid}` : `${e.user_id}`;
//                     console.log('r_key: ', r_key);
//                     store_key.push(r_key);
//                     await saveData(e, r_key);
//                 };
//             });
//             store_key.length > 0 ? await redisServices.redis('hset', redis_key, key, JSON.stringify(store_key)) :
//                 await redisServices.redis('hset', redis_key, key, JSON.stringify(object[key]));
//             continue;
//         }

//         if (typeof object[key] !== 'object') {

//             await redisServices.redis('hset', redis_key, key, object[key]);
//         } else if (object[key] !== null) {

//             const nestedKey = `${object[key].uuid}`;

//             await redisServices.redis('hset', redis_key, key, nestedKey);

//             await saveData(object[key], nestedKey);
//         }
//     }
// }

