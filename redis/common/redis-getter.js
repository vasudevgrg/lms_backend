// const redisServices = require("../../lib/redis-services");
// const { isUUID } = require("./common-functions");

// exports.redisGetter = async (redis_key) => {
//     const mainObject = await redisServices.redis('hgetall', redis_key);
//     const redis_output = {}; 

//     // Return false if mainObject is empty
//     if (Object.keys(mainObject).length === 0) {
//         return null;
//     }

//     let flag = false;

//     for (let key in mainObject) {
//         let value = mainObject[key];

//          value = typeof mainObject[key] === 'object' ? JSON.parse(mainObject[key]) : mainObject[key];
        
//         if (isUUID(value) && key != 'uuid' && key != 'user_id') {
//             continue;
//         }

//         if (Array.isArray(value)) {
//             redis_output[key] = await Promise.all(
//                 value.map(async (uuid) => {
//                     if (isUUID(uuid) && key != 'rows') return ; 
//                     const val = await this.redisGetter(uuid);
//                     if (val) return val;
//                     flag = true;
                   
//                 })
//             );
//         } else {
//             redis_output[key] = value; 
//         }
//     }
//     if (flag) return null;
//     return redis_output;
// };

const redisServices = require("../../lib/redis-services");

exports.redisGetter = async (redis_key) => {
    const mainObject = await redisServices.redis('hgetall', redis_key);
    // console.log('mainObject: ', mainObject); 

    if (Object.keys(mainObject).length === 0) {
       throw new Error(`no data related to this key: ${redis_key} in redis.`)
    }

    let flag = false;

    for (let key in mainObject) {
        let value = mainObject[key];

        if (typeof value === 'string') {
            try {
                const parsedValue = JSON.parse(value);
                value = parsedValue; 
            } catch (e) {
            }
        }

        // if (Array.isArray(value)) {
        //     console.log(value);
        //     if (key !== 'rows') continue;
        //     console.log("inside array")
        //     await Promise.all(
        //         value.map(async (uuid, index) => {
        //             const val = await this.redisGetter(uuid);
        //             if (val) {
        //                 value.splice(index, 1, val);
                        
        //             } else {
        //                 flag = true;
        //             }
        //         })
        //     );
        // } 
        mainObject[key] = value;
    }

    return mainObject;
};





// const redisServices = require("../../lib/redis-services");
// const { isUUID } = require("./common-functions");

// exports.redisGetter = async (redis_key) => {
//     const mainObject = await redisServices.redis('hgetall', redis_key);

//     const redis_output= {};

//     // Return false if mainObject is empty   
//     if (Object.keys(mainObject).length === 0) {
//         return false;
//     }

//     let flag = false;

//     for (let key in mainObject) {
//         let value = typeof mainObject[key] === 'object' ? JSON.parse(mainObject[key]) : mainObject[key];

//         console.log('value: ', key);
//         console.log('isUUID(value): ', isUUID(value));
//         if( isUUID(value)) continue;

//         if (Array.isArray(value)) {
//             await Promise.all(
//                 value.map(async (uuid, index) => {
//                     if(isUUID(value)) return;
//                     const val = await this.redisGetter(uuid);
//                     if (val) {
//                         value.splice(index, 1, val);
//                     } else {
//                         flag = true;
//                     }
//                 })
//             );
//         } else {
//             console.log("inside set");
//                 mainObject[key] = value;
//              }
//     }

//     if (flag) return false;
//     return mainObject;
// };
