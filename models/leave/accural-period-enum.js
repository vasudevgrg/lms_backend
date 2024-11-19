const { ENUM } = require("../common/enum");

class AccuralPeriod extends ENUM {
    static ENUM = {
        MONTHLY: "monthly",
        QUARTERLY: "quarterly",
        HALF_YEARLY: "half_yearly",
        YEARLY: "yearly",
    };
}

exports.AccuralPeriod = AccuralPeriod;