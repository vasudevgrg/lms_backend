const db = require("../models");
const { sequelize } = require("../config/db-connection");
const { BaseRepository } = require("./base-repository");
const { Op, where } = require("sequelize");
const { Paginator } = require("./common/pagination");
const { LeaveRequestStatus } = require("../models/leave/leave-request-status-enum");
const { generateMonthRange } = require("./common/date-validations");

class OrganizationRepository extends BaseRepository {
    constructor(payload) {
        super(payload);
    }
    async createOrganization(payload, transaction) {
        return await this.create(payload, { transaction });
    }

    async addOrganizationLeaves(organizationId, leaveTypeIds) {
        const organizationLeaveTypes = leaveTypeIds.map((leaveTypeId) => {
            return {
                organization_id: this.getLiteralFrom("organization", organizationId),
                leave_type_id: this.getLiteralFrom("leave_type", leaveTypeId),
            };
        });
        return await db.organization_leave.bulkCreate(organizationLeaveTypes);
    }

    async getFilteredOrganizations({
        order_type,
        order_column,
        page: pageOption,
        limit: limitOption,
    }) {
        let paranoid = true;
        const { offset, limit, page } = new Paginator(pageOption, limitOption);
        const order = [[order_column, order_type]];
        const attributes = {};
        const include = [
            {
                association: this.model.users,
                include: [
                    {
                        association: db.user.organization_role,
                        where: { role_id: { [Op.lte]: 3 } }, // organization role
                    },
                ],
            },
        ];
        const response = await this.findAndCountAll(
            {},
            include,
            offset,
            limit,
            order,
            paranoid,
            attributes
        );
        response.current_page = page + 1;
        response.per_page = limit;
        response.total = await this.count({}, { paranoid });
        return response;
    }

    async getOrganizationById(organizationUUID, transaction) {
        const criteria = { uuid: { [Op.eq]: organizationUUID } };
        return await this.findOne(criteria, [], null, {}, transaction);
    }

    async updateOrganizationById(organizationId, organizationData) {
        const criteria = { uuid: { [Op.eq]: organizationId } };
        return await this.update(criteria, organizationData);
    }

    async getLeavesCount (organization_uuid, date_range) {
        const criteria = {};
        const leaveRequestCriteria = {};
        if(organization_uuid) {
            criteria.uuid = {[Op.eq]:organization_uuid};
        }
        if(date_range) {
            leaveRequestCriteria.start_date = {[Op.between]: date_range}
        };
        leaveRequestCriteria.status={[Op.eq]: LeaveRequestStatus.ENUM.APPROVED};
        const include = [
            {
             association: this.model.users,
             attributes: [],
             where: {
                organization_id: {[Op.eq]:this.getLiteralFrom('organization',organization_uuid)}
             },
             include: [
                {
                    association: db.user.leave_requests,
                    attributes: [],
                where: leaveRequestCriteria,
                required: false
                }
            ]
        }
        ];
        const attributes= [
            [this.sequelize.fn("COUNT", this.sequelize.col("users.leave_requests.id")),'total_leaves'],
            [this.sequelize.fn( "TO_CHAR",this.sequelize.col("users.leave_requests.start_date"),'YYYY-MM'),'month']
        ]
        const res = await this.findAll(criteria, include, true, attributes, undefined, {group: ['Organization.id','month'], raw: true});
        const monthsInRange = generateMonthRange(date_range);
        const mergedResult = monthsInRange.map(month => ({
            month,
            count: res.find(r => r.month === month)?.count || 0
        }));
    
        return mergedResult;
    }
    
    async getLeaveTypesCount  (organization_uuid, date_range) {
        const criteria = {};
        const leaveRequestCriteria = {};
        if(organization_uuid) {
            criteria.uuid = {[Op.eq]:organization_uuid};
        }
        if(date_range) {
            leaveRequestCriteria.start_date = {[Op.between]: date_range}
        };
        leaveRequestCriteria.status={[Op.eq]: LeaveRequestStatus.ENUM.APPROVED};
        const include = [
        {
            association:this.model.leave_types,
            attributes:[
                "code",
                "uuid",
                [this.sequelize.fn("COUNT",this.sequelize.col("leave_types.leave_requests.id")),"count"]
            ],
            include:[
                {
                    association:db.leave_type.leave_requests,
                    attributes:[],
                    where: leaveRequestCriteria,
                    required: false
                }
            ]
        }
        ];
        const attributes= []
        const res = await this.findAll(criteria, include, true, attributes, undefined,
            {group: ['Organization.id',"leave_types.id"]}
        );
        return res[0].leave_types
    };

    // async getLeaveReport  (organization_uuid, date_range) {
    //     const criteria = {};
    //     const leaveRequestCriteria = {};
    //     if(organization_uuid) {
    //         criteria.uuid = {[Op.eq]:organization_uuid};
    //     }
    //     if(date_range) {
    //         leaveRequestCriteria.start_date = {[Op.between]: date_range}
    //     };
    //     leaveRequestCriteria.status={[Op.eq]: LeaveRequestStatus.ENUM.APPROVED};
    //     const include = [
    //         {
    //             association:this.model.leave_types,
    //             required: false,
    //             attributes:[
    //                 "code",
    //                 "uuid",
    //                 [this.sequelize.fn("COUNT",this.sequelize.col("leave_types.leave_requests.id")),"count"]
    //             ],
    //             include:[
    //                 {
    //                     association:db.leave_type.leave_requests,
    //                     attributes:[],
    //                     where: leaveRequestCriteria,
    //                     required: false
    //                 }
    //             ]
    //         }
    //     ];
    //     const attributes= [
            
    //         [this.sequelize.fn("COUNT", this.sequelize.col("leave_types.id")),'total_leaves'],
    //         [this.sequelize.fn( "TO_CHAR",this.sequelize.col("leave_types.leave_requests.start_date"),'YYYY-MM'),'month'],
    //     ]
    //     const res = await this.findAll(criteria, include, true, attributes, undefined,
    //         {group: ['Organization.id',"leave_types.id",'month']}
    //     );
    //     return res[0]
    // };

    
}

module.exports = {
    organizationRepository: new OrganizationRepository({
        sequelize: sequelize,
        model: db.organization,
    }),
};
