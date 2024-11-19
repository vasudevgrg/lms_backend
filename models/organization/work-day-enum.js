const { ENUM } = require('../common/enum');

class WorkDay extends ENUM {
    static ENUM = {
        MON_FRI: 'mon_fri',
        MON_SAT: 'mon_sat',
        WHOLE_WEEK: 'whole_week',
    };
}

exports.WorkDay = WorkDay;