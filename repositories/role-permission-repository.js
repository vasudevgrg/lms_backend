const db = require("../models");
const { sequelize } = require("../config/db-connection");
const { BaseRepository } = require("./base-repository");

class RolePermissionRepository extends BaseRepository {
  constructor(payload) {
    super(payload);
  }

  async bulkCreateRolePermissions(payload, transaction) {
    return this.bulkCreate(payload, { transaction, updateOnDuplicate: ["action"] });
  }
}

module.exports = {
  rolePermissionRepository: new RolePermissionRepository({
    sequelize: sequelize,
    model: db.role_permission,
  }),
};
