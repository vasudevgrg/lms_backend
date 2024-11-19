const { ENUM } = require('./enum');

class Status extends ENUM {
  static ENUM = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  };
}

exports.Status = Status;
