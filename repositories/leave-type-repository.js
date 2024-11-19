const db = require('../models');
const { sequelize } = require('../config/db-connection');
const { BaseRepository } = require('./base-repository');
const { Op } = require('sequelize');
const { isEndOfMonth, isStartOfMonth } = require('./common/date-validations');
const { AccuralApplicableOn } = require('../models/leave/accural-applicable-on-enum');
const { Paginator } = require('./common/pagination');
const { LeaveRequestStatus } = require('../models/leave/leave-request-status-enum');

class LeaveTypeRepository extends BaseRepository {
    constructor(payload) {
        super(payload)
    }

    async getFilteredLeaveTypes({ code, organization_uuid }, { order_type, order_column, page: pageOption, limit: limitOption }) {
        const criteria = { organization_id: { [Op.eq]: this.getLiteralFrom('organization', organization_uuid) } };
        const countCriteria = { organization_id: { [Op.eq]: this.getLiteralFrom('organization', organization_uuid) } };
        const { offset, limit, page } = new Paginator(pageOption, limitOption);
        if (code) criteria.code = { [Op.iLike]: `%${code}%` };
        const order = [[order_column, order_type]];

        const response = await this.findAndCountAll(criteria, [], offset, limit, order);
        response.current_page = page + 1;
        response.per_page = limit;
        response.total = await this.count(countCriteria);
        return response;
    }

    async createLeaveType(payload, transaction) {
        return this.create(payload, { transaction });
    }

    async getLeaveTypesByCrireria({ organization_uuid, leave_type_uuid }, transaction) {
        const criteria = {};
        if (organization_uuid) criteria.organization_id = { [Op.eq]: this.getLiteralFrom('organization', organization_uuid) };

        if (leave_type_uuid) criteria.uuid = { [Op.eq]: leave_type_uuid };

        if (isEndOfMonth()) criteria.accural = { applicable_on: { [Op.ne]: AccuralApplicableOn.ENUM.START } };

        if (isStartOfMonth()) criteria.accural = { applicable_on: { [Op.ne]: AccuralApplicableOn.ENUM.END } };

        const include = [
            {
                association: this.model.leave_balances,
                include: [
                    {
                        association: db.leave_balance.user,
                        attributes: ['date_of_joining','name']
                    }
                ]
            }
        ];
        return this.findAll(criteria, include, undefined, undefined, transaction);
    }

    async getLeaveTypeById(leave_type_uuid, organization_uuid) {
        const criteria = { uuid: { [Op.eq]: leave_type_uuid } };
        if (organization_uuid) criteria.organization_id = { [Op.eq]: this.getLiteralFrom('organization', organization_uuid) };
        return this.findOne(criteria);
    }

    async getLeaveTypesByOrganizationRoleUUID(organizationRoleUUID, transaction) {
        const criteria = {
            [Op.or]: [
                {
                    applicable_for: {
                        value: "all"
                    }
                },
                {
                    [Op.and]: [
                        {
                            applicable_for: {
                                type: "role"
                            }
                        },
                        this.sequelize.literal(`'${organizationRoleUUID}' = ANY (SELECT jsonb_array_elements_text("applicable_for"->'value'))`)
                    ]

                }
            ]
        }
        return this.findAll(criteria, [], undefined, undefined, transaction);
    }

    async updateLeaveTypeById(leave_type_uuid, payload) {
        let criteria = { uuid: { [Op.eq]: leave_type_uuid } };
        return this.update(criteria, payload);
    }

    async getLeaveReport  (organization_uuid, date_range) {
        const criteria = {};
        const leaveRequestCriteria = {};
        if(organization_uuid) {
            criteria.organization_id = {[Op.eq]:this.getLiteralFrom('organization', organization_uuid)};
        }
        if(date_range) {
            leaveRequestCriteria.start_date = {[Op.between]: date_range}
        };
        leaveRequestCriteria.status={[Op.eq]: LeaveRequestStatus.ENUM.APPROVED};
        const include = [
                    {
                        association:db.leave_type.leave_requests,
                        attributes:[],
                        where: leaveRequestCriteria,
                        required: false
                    }
        ];
        const attributes= [
            "name",
            "code",
            [this.sequelize.fn("COUNT", this.sequelize.col("leave_requests.id")),'total_leaves'],
            [this.sequelize.fn( "TO_CHAR",this.sequelize.col("leave_requests.start_date"),'YYYY-MM'),'month'],
        ]
        const res = await this.findAll(criteria, include, true, attributes, undefined,
            {group: ['LeaveType.id','month']}
        );
        return res
    };
}

module.exports = {
    leaveTypeRepository: new LeaveTypeRepository({
        sequelize: sequelize,
        model: db.leave_type
    })
}