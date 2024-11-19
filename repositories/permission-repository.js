const db = require("../models");
const { sequelize } = require("../config/db-connection");
const { BaseRepository } = require("./base-repository");

class PermissionRepository extends BaseRepository {
  constructor(payload) {
    super(payload);
  }

  async getAllPermissions() {
    return this.findAll();
  }
}

module.exports = {
  permissionRepository: new PermissionRepository({
    sequelize: sequelize,
    model: db.permission,
  }),
};
