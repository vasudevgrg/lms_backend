const { Op } = require("sequelize");
const db = require("../models");
const { sequelize } = require("../models");
const { BaseRepository } = require("./base-repository");

class UserPersonalDataRepository extends BaseRepository {
    async updateUserPersonalDetailsById(user_id, payload, transaction) {
        const criteria = { user_id: { [Op.eq]: user_id } };

        const existingRecord = await this.findOne(criteria);

        if (existingRecord) {
            return this.update(criteria, payload);
        } else {
            return this.create(payload);
        }
    }
}

module.exports = {
    userPersonalDataRepository: new UserPersonalDataRepository({
        sequelize: sequelize,
        model: db.user_personal_data
    })
}