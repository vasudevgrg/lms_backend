const { ENUM } = require('./enum');

class Gender extends ENUM {
    static ENUM = {
        MALE: "male",
        FEMALE: "female",
    };
}

exports.Gender = Gender;
