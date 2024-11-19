const { sequelize } = require("../config/db-connection");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class AttachmentRepository extends BaseRepository{
    async updateAttachment (id, payload) {
        const criteria = { id: { [Op.eq]: id } };
        return this.update(criteria, payload);
    };

    async createAttachment (payload) {
        console.log(payload);
        return this.create(payload);
    }
}

module.exports = {
    attachmentRepository: new AttachmentRepository({
        sequelize: sequelize,
        model: db.attachment
    })
}