const { ENUM } = require('../common/enum');

class BloodGroup extends ENUM {
    static ENUM = {
        A_POSITIVE: 'A+',
        A_NEGATIVE: 'A-',
        B_POSITIVE: 'B+',
        B_NEGATIVE: 'B-',
        AB_POSITIVE: 'AB+',
        AB_NEGATIVE: 'AB-',
        O_POSITIVE: 'O+',
        O_NEGATIVE: 'O-',
    };
}

exports.BloodGroup = BloodGroup;
