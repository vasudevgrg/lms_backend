const { ENUM } = require('./enum');

class MaritalStatus extends ENUM {
    static ENUM = {
        SINGLE: 'single',
        MARRIED: 'married',
        DIVORCED: 'divorced',
        WIDOWED: 'widowed',
    };
}

exports.MaritalStatus = MaritalStatus;
