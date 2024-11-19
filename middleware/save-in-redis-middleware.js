// const redisServices = require("../lib/redis-services");

// // exports.saveInRedis = async (req, res, next) => {
// //     // const key = req.originalUrl ;
// //     // const value = await redisServices.get(key);

// //     // if(!value) {
// //     //     const data = res.send();
// //     //     await redisServices.add(key, data);
// //     // }
// //     console.log(req.originalUrl);
// //     console.log(res,'aa');
// //     next();
// // }

// exports.save = (saveData) => async (req, res, next) => {
//     const key = req.originalUrl;

//     const originalSend = res.send.bind(res);

//     res.send = async (body) => {
//         redis_key = this.formatRedisKey(key);

//         // await redisServices.redis('set', key, redis_key);
//         await saveData(body, redis_key);

//         originalSend(body);
//     };

//     next();
// };

// exports.saveInRedis = async (req, res, next) => {
//     const originalSend = res.send.bind(res);

//     res.send = async (body) => {
//         redis_key = this.convertToRedisKey(req.originalUrl);
//         console.log('redis_key: ', redis_key);

//         // await redisServices.redis('set', key, redis_key);
//         await this.saveData(body, redis_key);

//         originalSend(body);
//     };

//     next();
// };


// exports.saveData = async (object, redis_key) => {

//     if (typeof object === 'string') object = JSON.parse(object);



//     for (let key in object) {
//         if (Array.isArray(object[key])) {
//             let store_key = [];
//             await object[key].map(async e => {
//                 if (e.uuid || e.user_id) {
//                     const r_key = e.uuid ? `${e.uuid}` : `${e.user_id}`;
//                     console.log('r_key: ', r_key);
//                     store_key.push(r_key);
//                     await this.saveData(e, r_key);
//                 };
//             });
//             store_key.length > 0 ? await redisServices.redis('hset', redis_key, key, JSON.stringify(store_key)) :
//                 await redisServices.redis('hset', redis_key, key, JSON.stringify(object[key]));
//             continue;
//         }

//         if (typeof object[key] !== 'object') {

//             await redisServices.redis('hset', redis_key, key, object[key]);
//         } else if (object[key] !== null) {

//             const uuid = object[key].uuid ? `${object[key].uuid}` : `${object[key].user_id}`;

//             if (uuid != "undefined") {
//                 await redisServices.redis('hset', redis_key, key, uuid);
//                 await this.saveData(object[key], uuid)
//             }
//             else {
//                 await redisServices.redis('hset', redis_key, key, JSON.stringify(object[key]));
//             }
//         }
//     }
// }

// exports.convertToRedisKey = (url) => {
//     const arr = url.split("?");
//     const path = arr[0];
//     const segments = path.split('/').filter(Boolean);

//     if (segments.length === 1) {
//         if (arr.length > 1) {
//             return `${segments[0]}:${arr[1]}`;
//         } else {
//             return segments[0];
//         }
//     } else if (segments.length == 2) {
//         if (arr.length > 1) {
//             return `${segments[1]}:${arr[1]}`;
//         } else {
//             return segments[1];
//         }
//     } else if (segments.length == 3) {
//         if (arr.length > 1) {
//             return `${segments[1]}:${segments[2]}:${arr[1]}`;
//         } else {
//             return `${segments[1]}:${segments[2]}`;
//         }
//     } else if (segments.length == 4) {
//         if (arr.length > 1) {
//             return `${segments[3]}:${arr[1]}`;
//         } else {
//             return segments[3];
//         }
//     } else {
//         return segments.join(":");
//     }
// }



// // {
// //     "user_id": "1a2cf010-3501-4460-88b1-6ff8a43c6b6e",
// //     "type": "full_time",
// //     "bradford_score": 0,
// //     "name": "vasuddddev Doe",
// //     "email": "vasuddedv@example.com",
// //     "status": "active",
// //     "phone_number": "+12345652f27890",
// //     "date_of_joining": "2023-11-15T00:00:00.000Z",
// //     "profile_image": {
// //         "uuid": "2b018be2-d815-42dd-ab72-cb496769f149",
// //         "name": "stock_image",
// //         "url": "https://dummyjson.com/image/200x200/008080/ffffff?text=v",
// //         "size": "2",
// //         "updated_at": "2024-11-12T07:23:49.535Z",
// //         "created_at": "2024-11-12T07:23:49.535Z",
// //         "deleted_at": null
// //     },
// //     "personal_detail": {
// //         "parent_information": null,
// //         "emergency_contact": null,
// //         "dob": "2023-11-10T18:30:00.000Z",
// //         "blood_group": null,
// //         "marital_status": null,
// //         "current_address": null,
// //         "permanent_address": null,
// //         "gender": null,
// //         "updated_at": "2024-11-12T07:23:49.546Z",
// //         "created_at": "2024-11-12T07:23:49.546Z",
// //         "email": null,
// //         "deleted_at": null
// //     },
// //     "updated_at": "2024-11-12T07:23:49.527Z",
// //     "created_at": "2024-11-12T07:23:49.527Z",
// //     "profile_image_id": 20,
// //     "deleted_at": null
// // }