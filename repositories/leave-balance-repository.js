const db = require('../models');
const { sequelize } = require('../config/db-connection');
const { BaseRepository } = require('./base-repository');
const { Op } = require('sequelize');

class LeaveBalanceRepository extends BaseRepository {
    constructor(payload) {
        super(payload)
    }

    async getLeaveBalancesOfUserByUserUUID(user_uuid) {
        const criteria = { user_id: { [Op.eq]: this.getLiteralFrom('user', user_uuid, 'user_id') } };
        const include = [
            {
                association: this.model.leave_type
            }
        ];
        return this.findAll(criteria, include);
    }

    async getLeaveBalanceByUUIDS(user_uuid, leave_type_uuid, transaction) {
        const criteria = {
            user_id: { [Op.eq]: this.getLiteralFrom('user', user_uuid, 'user_id') },
            leave_type_id: { [Op.eq]: this.getLiteralFrom('leave_type', leave_type_uuid) }
        };
        const include = [
            {
                association: this.model.leave_type
            }
        ];
        return this.findOne(criteria, include, undefined, {}, transaction);
    }

    async createLeaveBalance(payload, transaction) {
        return this.create(payload, { transaction });
    }

    async updateLeaveBalanceByUUIDS({ user_uuid, leave_type_uuid }, payload, transaction) {
        const criteria = {};

        if (user_uuid) criteria.user_id = { [Op.eq]: this.getLiteralFrom('user', user_uuid, 'user_id') };
        if (leave_type_uuid) criteria.leave_type_id = { [Op.eq]: this.getLiteralFrom('leave_type', leave_type_uuid) };

        return this.update(criteria, payload, { transaction });
    }

    async bulkCreateLeaveBalances(payload, transaction) {
        return this.bulkCreate(payload, { transaction });
    }
}

module.exports = {
    leaveBalanceRepository: new LeaveBalanceRepository({
        sequelize: sequelize,
        model: db.leave_balance
    })
}