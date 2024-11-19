const db = require('../models');
const { sequelize } = require('../config/db-connection');
const { BaseRepository } = require('./base-repository');
const { Op, where } = require("sequelize");
const { LeaveRequestStatus } = require('../models/leave/leave-request-status-enum');
const { Paginator } = require('./common/pagination');

class LeaveRequestRepository extends BaseRepository {
    constructor(payload) {
        super(payload)
    }

    async getFilteredLeaveRequests({ user_uuid, leave_type_uuid, manager_uuid, organization_uuid, date, date_range, department_uuid, status }, { archive, page: pageOption, limit: limitOption }) {
        let criteria = {};
        let managerCriteria = {};
        let leaveTypeCriteria = {};
        let userCriteria = {};
        let paranoid = true;
        let countCriteria = {};
        const { offset, limit, page } = new Paginator(pageOption, limitOption);

        if (status) criteria.status = { [Op.eq]: status };
        if (date) criteria.start_date = { [Op.eq]: date };
        if (date_range) criteria.start_date = { [Op.between]: date_range };

        if (leave_type_uuid) leaveTypeCriteria.uuid = { [Op.eq]: leave_type_uuid };

        if (manager_uuid) managerCriteria.user_id = { [Op.eq]: manager_uuid };

        if (user_uuid) userCriteria.user_id = { [Op.eq]: user_uuid };
        if (organization_uuid) {
            userCriteria.organization_id = { [Op.eq]: this.getLiteralFrom('organization', organization_uuid) };
            countCriteria.organization_id = { [Op.eq]: this.getLiteralFrom('organization', organization_uuid) };
        }
        if (department_uuid) {
            userCriteria.department_id = { [Op.eq]: this.getLiteralFrom('department', department_uuid) };
            countCriteria.department_id = { [Op.eq]: this.getLiteralFrom('department', department_uuid) };
        }

        if (archive) paranoid = false;

        const include = [
            {
                association: this.model.user,
                where: userCriteria,
            },
            {
                association: this.model.leave_type,
                where: leaveTypeCriteria,
                attributes: ['name', "uuid"]
            },
            {
                association: this.model.managers,
                include: [
                    {
                        association: db.leave_request_manager.user,
                        where: managerCriteria,
                    },
                ]
            }
        ]
        const response = await this.findAndCountAll(criteria, include, offset, limit, [['updated_at', "DESC"]], paranoid);
        response.current_page = page + 1;
        response.per_page = limit;
        response.total = await this.count(criteria, { paranoid });
        return response;
    }

    async createLeaveRequest(payload) {
        const { user_uuid, leave_type_uuid, start_date, end_date, reason, type, managers } = payload;
        const include = [
            {
                association: this.model.managers
            }
        ];

        const leaveRequest = {
            user_id: this.getLiteralFrom('user', user_uuid, 'user_id'),
            leave_type_id: this.getLiteralFrom('leave_type', leave_type_uuid),
            start_date,
            end_date,
            reason,
            type,
            leave_duration: this.model.calculateLeaveDuration(payload),
            managers: managers.map(manager => (
                {
                    user_id: this.getLiteralFrom('user', manager, 'user_id')
                }
            ))
        }

        return this.create(leaveRequest, { include })
    }

    async getLeaveRequestByUUID(leaveRequestUUID, transaction) {
        let criteria = { uuid: { [Op.eq]: leaveRequestUUID } }
        const include = [
            {
                association: this.model.user,
                include: [
                    {
                        association: db.user.organization,
                    },
                    {
                        association: db.user.organization_role,
                        include: [
                            {
                                association: db.organization_role.role,
                            }
                        ]
                    }
                ]
            },
            {
                association: this.model.leave_type,
                include: [
                    {
                        association: db.leave_type.leave_balances,
                        where: {
                            user_id: {
                                [Op.eq]: this.sequelize.col('user.id')
                            }
                        }
                    }
                ]
            },
            {
                association: this.model.managers,
                include: [
                    {
                        association: db.leave_request_manager.user,
                        include: [
                            {
                                association: db.user.organization,
                            },
                            {
                                association: db.user.organization_role,
                                include: [
                                    {
                                        association: db.organization_role.role,
                                    }
                                ]
                            }
                        ]
                    },
                ]
            }
        ]
        const leaveRequest = await this.findOne(criteria, include, undefined, undefined, transaction)
        leaveRequest.leave_balance = leaveRequest.leave_type.leave_balances[0]
        delete leaveRequest.leave_type.leave_balances
        return leaveRequest;
    }

    async updateLeaveRequestStatus(leaveRequestId, payload) {
        const { status, user } = payload
        const criteria = { uuid: { [Op.eq]: leaveRequestId } }
        const include = [
            {
                association: this.model.user,
                include: [
                    {
                        association: db.user.organization_role,
                    }
                ]
            }
        ]
        const leaveRequest = await this.findOne(criteria, include)
        if (!leaveRequest) return null;

        if (status === LeaveRequestStatus.ENUM.APPROVED) {
            leaveRequest.markLeaveRequestApproved(user)
        }
        if (status === LeaveRequestStatus.ENUM.REJECTED) {
            leaveRequest.markLeaveRequestRejected(user)
        }
        if (status === LeaveRequestStatus.ENUM.CANCELLED) {
            leaveRequest.markLeaveRequestCancelled(user)
        }
        await leaveRequest.save()
        return leaveRequest
    }

    async updateLeaveRequestById(leaveRequestId, payload, transaction) {
        const criteria = { uuid: { [Op.eq]: leaveRequestId } }
        const { user_uuid, leave_type_uuid, start_date, end_date, reason, type, managers } = payload;

        const leaveRequest = {
            user_id: this.getLiteralFrom('user', user_uuid, 'user_id'),
            leave_type_id: this.getLiteralFrom('leave_type', leave_type_uuid),
            start_date,
            end_date,
            reason,
            type,
            leave_duration: this.model.calculateLeaveDuration(payload),
        }
        return this.update(criteria, leaveRequest, [], transaction )
    }

    async getApprovedLeaveRequestCount({ user_uuid, date_range }) {
        const criteria = {};

        if (user_uuid) criteria.user_id = { [Op.eq]: this.getLiteralFrom("user", user_uuid, 'user_id') };
        if (date_range) {
            const [startDate, endDate] = date_range;
            const formattedStartDate = new Date(startDate).setHours(0, 0, 0, 0);
            criteria.start_date = { [Op.between]: [formattedStartDate, endDate] };
        };

        criteria.status = { [Op.eq]: LeaveRequestStatus.ENUM.APPROVED };

        const attribute = [
            [this.sequelize.fn('SUM', this.sequelize.literal('end_date - start_date')), 'count']
        ];

        const result = await this.findAll(criteria, undefined, true, attribute, undefined);
        if (!result || result.length === 0) {
            return 0;
        }

        return Number(result[0].toJSON().count);

    }
}

module.exports = {
    leaveRequestRepository: new LeaveRequestRepository({
        sequelize: sequelize,
        model: db.leave_request
    })
}