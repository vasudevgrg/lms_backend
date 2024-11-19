const db = require("../models");
const { sequelize } = require("../config/db-connection");
const { BaseRepository } = require("./base-repository");

class ActionRepository extends BaseRepository {
  constructor(payload) {
    super(payload);
  }

  async getActions() {
    return this.findAll();
  }
}
module.exports = {
  actionRepository: new ActionRepository({
    sequelize: sequelize,
    model: db.action,
  }),
};
