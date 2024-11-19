const db = require("../models");
const { sequelize } = require("../config/db-connection");
const { BaseRepository } = require("./base-repository");

class LeaveRequestManagerRepository extends BaseRepository {
  constructor(payload) {
    super(payload);
  }

  async bulkCreateLeaveRequestManagers(leaveRequestId, managerUUIDs, options = {}) {
    const leaveRequestManagers = managerUUIDs.map((uuid) => {
      return {
        leave_request_id: leaveRequestId,
        user_id: this.getLiteralFrom("user", uuid, "user_id"),
      };
    });
    return this.bulkCreate(leaveRequestManagers, { ...options, ignoreDuplicates: true });
  }
}

module.exports = {
  leaveRequestManagerRepository: new LeaveRequestManagerRepository({
    sequelize: sequelize,
    model: db.leave_request_manager,
  }),
};
