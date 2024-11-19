const db = require('../models');
const { sequelize } = require('../config/db-connection');
const { BaseRepository } = require('./base-repository');
const { Op, where } = require("sequelize");
const { Paginator } = require('./common/pagination');
const { LeaveRequestStatus } = require('../models/leave/leave-request-status-enum');
const { AttendanceStatus } = require('../models/attendance/attendance-status-enum');
const { generateMonthRange } = require('./common/date-validations');
const { userPersonalDataRepository } = require('./user-personal-data-repository');
const { attachmentRepository } = require('./attachment-repository');

class UserRepository extends BaseRepository {
    constructor(payload) {
        super(payload)
    }

    _getAssociation() {
        const include = [
            {
                association: this.model.organization,
            },
            {
                association: this.model.organization_role,
                include: [
                    {
                        association: db.organization_role.role,
                    },
                    {
                        association: db.organization_role.role_permissions,
                        include: [
                            {
                                association: db.role_permission.permission,
                            }
                        ]
                    }
                ]
            },
            {
                association: this.model.department,
            },
            {
                association: this.model.personal_detail
            },
            {
                association: this.model.profile_image
            }
        ];
        return include;
    }

    async getFilteredUsers({ email, status, organization_uuid, role_uuid, department_uuid, child_uuid }, { archive, page: pageOption, limit: limitOption }) {
        let criteria = {};
        const countAssociation = [];
        let paranoid = true;
        if (status) criteria.status = { [Op.eq]: status };
        if (email) criteria.email = { [Op.like]: `%${email}%` };
        if (archive) paranoid = false;
        console.log(pageOption, limitOption);
        const { offset, limit, page } = new Paginator(pageOption, limitOption);
        const include = [];
        if (organization_uuid) {
            include.push({ association: this.model.organization, where: { uuid: { [Op.eq]: organization_uuid } }, attributes: [] });
            countAssociation.push({ association: this.model.organization, where: { uuid: { [Op.eq]: organization_uuid } }, attributes: [] });
        }
        if (role_uuid) include.push({ association: this.model.organization_role, where: { role_id: { [Op.eq]: this.getLiteralFrom('role', role_uuid) } }, attributes: [] });
        if (department_uuid) include.push({ association: this.model.department, where: { uuid: { [Op.eq]: department_uuid } }, attributes: [] });
        // if (child_uuid) include.push({ association: this.model.parent, attributes: [] });

        const response = await this.findAndCountAll(criteria, include, offset, limit, null, paranoid);
        response.current_page = page + 1;
        response.per_page = limit;
        response.total = await this.count({}, { include: countAssociation, paranoid });
        return response;
    }

    async getOrganizationUsers({ organization_uuid, organization_id }) {
        const criteria = {};
        if (organization_uuid) criteria.organization_id = { [Op.eq]: this.getLiteralFrom('organization', organization_uuid) };
        if (organization_id) criteria.organization_id = organization_id;
        return this.findAll(criteria);
    }

    async createUser(payload, transaction) {
        const include = this._getAssociation()
        return this.create(payload, { include, transaction })
    }

    async getUserIdsByCriteria({ organization_uuid, organization_id, user_uuids, organization_role_uuids }, transaction) {
        const criteria = {};
        const include = [];
        if (organization_id) criteria.organization_id = { [Op.eq]: organization_id };
        if (organization_uuid) criteria.organization_id = { [Op.eq]: this.getLiteralFrom('organization', organization_uuid) };
        if (user_uuids) criteria.user_id = { [Op.in]: user_uuids };
        // if (role_uuids) {
        //     const roleIds = await this.sequelize.query(`SELECT id FROM role WHERE uuid IN (${role_uuids.map(role => `'${role}'`).join(',')})`, { type: this.sequelize.QueryTypes.SELECT });
        //     include.push(
        //         {
        //             association: this.model.organization_role,
        //             where: { role_id: { [Op.in]: roleIds.map(roleId => roleId.id) } },
        //             attributes: []
        //         }
        //     );
        // }
        if (organization_role_uuids) {
            include.push(
                {
                    association: this.model.organization_role,
                    where: { uuid: { [Op.in]: organization_role_uuids } },
                    attributes: []
                }
            );
        }
        return this.findAll(criteria, include, false, ['id'], transaction).then(users => users.map(user => user.id));
    }

    async getUserById(userId, withAssociations = true, transaction) {
        let criteria = { user_id: { [Op.eq]: userId } }
        const include = this._getAssociation()
        return this.findOne(criteria, withAssociations ? include : [], undefined, undefined, transaction);
    }

    async updateUserById(userId, payload) {
        const criteria = { user_id: { [Op.eq]: userId } };
        const user_payload = {
            ...payload,
            role_id: payload.role_uuid ? this.getLiteralFrom('role', payload.role_uuid) : undefined,
            department_id: payload.department_uuid ? this.getLiteralFrom('department', payload.department_uuid) : undefined,
        };
        const user = await this.getUserById(userId);
        const output=await this.update(criteria, user_payload);
        const user_id =await this.getLiteralFrom('user', userId, 'user_id');

        payload.personal_detail.user_id = user_id;  

        await userPersonalDataRepository.updateUserPersonalDetailsById(user_id, payload.personal_detail);

        if(user.profile_image_id) {
            await attachmentRepository.updateAttachment(user.profile_image_id, payload.profile_image);
        }else{
            await  attachmentRepository.createAttachment(payload.profile_image);

        }
        return output;
    
    }

    async getLeaveReport(user_uuid, date_range) {
        const criteria = user_uuid ? { user_id: user_uuid } : {};

        const leaveRequestCriteria = {
            ...(date_range && { start_date: { [Op.between]: date_range } }),
            status: LeaveRequestStatus.ENUM.APPROVED
        };

        const include = [{
            association: this.model.leave_requests,
            attributes: [],
            where: leaveRequestCriteria,
            required: false
        }];

        const attributes = [

            [this.sequelize.fn("COUNT", this.sequelize.col("leave_requests.start_date")), 'total_leaves'],
            [this.sequelize.fn("TO_CHAR", this.sequelize.col("leave_requests.start_date"), 'YYYY-MM'), 'month']
        ];

        const res = await this.findAll(criteria, include, true, attributes, undefined, {
            group: ['month', 'User.id'],
            raw: true
        });

        const monthsInRange = generateMonthRange(date_range);

        // Merge results with placeholder months
        const mergedResult = monthsInRange.map(month => ({
            month,
            total_leaves: res.find(r => r.month === month)?.total_leaves || 0
        }));

        return mergedResult;
    }





    async getUsersCount(organization_uuid) {
        const criteria = {};

        if (organization_uuid) {
            criteria.organization_id = { [Op.eq]: this.getLiteralFrom('organization', organization_uuid) };
        }

        console.log(criteria);

        const attributes = [
            [this.sequelize.fn('COUNT', this.sequelize.col('organization_id')), 'count']
        ];

        const res = await this.findAll(criteria, [], true, attributes
        );
        return res;
    }

    async getAttendanceMonthly({ user_uuid, organization_uuid, date_range }) {
        const criteria = {
            ...(user_uuid && { user_id: user_uuid }),
            ...(organization_uuid && { organization_id: this.getLiteralFrom('organization', organization_uuid) })
        };

        const attendanceCriteria = {
            ...(date_range && { date: { [Op.between]: date_range } }),
            status: {
                [Op.notIn]: [
                    AttendanceStatus.ENUM.ABSENT,
                    AttendanceStatus.ENUM.ON_LEAVE,
                    AttendanceStatus.ENUM.HOLIDAY
                ]
            }
        };

        const include = [{
            association: this.model.attendances,
            attributes: [],
            where: attendanceCriteria,
            required: false
        }];

        const attributes = [
            [this.sequelize.fn('COUNT', this.sequelize.col('attendances.id')), 'count'],
            [this.sequelize.fn('TO_CHAR', this.sequelize.col('attendances.date'), 'YYYY-MM'), 'month']
        ];

        const res = await this.findAll(criteria, include, true, attributes, undefined, {
            group: ['User.id', 'month'],
            raw: true
        });

        const monthsInRange = generateMonthRange(date_range);
        const mergedResult = monthsInRange.map(month => ({
            month,
            count: res.find(r => r.month === month)?.count || 0
        }));

        return mergedResult;
    }
};
module.exports = {
    userRepository: new UserRepository({
        sequelize: sequelize,
        model: db.user
    })
}