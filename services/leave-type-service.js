const { NotFoundError, BadRequestError } = require('../middleware/error');
const { isValidUUID } = require('../models/common/validator');
const { leaveBalanceRepository } = require('../repositories/leave-balance-repository');
const { leaveTypeRepository } = require('../repositories/leave-type-repository');
const { organizationRepository } = require('../repositories/organization-repository');
const { transactionRepository } = require('../repositories/transaction-repository');
const { userRepository } = require('../repositories/user-repository');

exports.validatingQueryParameters = async (payload) => {
    let { order, order_column, organization_uuid } = payload.query;

    // Validate and adjust order parameter
    if (order && !(order.toLowerCase() === "asc" || order.toLowerCase() === "desc")) payload.query.order = "DESC";
    else payload.query.order = order?.toUpperCase() || "DESC";

    // Validate and adjust order_column parameter against available columns
    const columns = await leaveTypeRepository.allColumnsName();
    if ((order_column && !columns[order_column]) || !order_column) {
        payload.query.order_column = "updated_at";
    }

    return payload;
};

exports.getFilteredLeaveTypes = async (payload) => {
    const { organization_uuid } = payload.params;

    if (!organization_uuid || !isValidUUID(organization_uuid)) throw new BadRequestError("Invalid organization uuid.", `Organization uuid ${organization_uuid} is not a valid uuid.`);

    const organization = await organizationRepository.getOrganizationById(organization_uuid);
    if (!organization) throw new NotFoundError("Organization not found.", `Organization with id ${organization_uuid} not found.`);

    payload = await this.validatingQueryParameters(payload);
    let { code, page = 1, limit = 10, order, order_column, } = payload.query;

    return leaveTypeRepository.getFilteredLeaveTypes({ code, organization_uuid }, { order_type: order, order_column, page, limit })
};

exports.createLeaveType = async (payload) => {
    const { organization_uuid } = payload.params;
    const leaveTypePayload = payload.body;
    const transaction = await transactionRepository.startTransaction();
    try {
        const organization = await organizationRepository.getOrganizationById(organization_uuid, transaction)
        if (!organization) throw new NotFoundError("Organization not found.", `Organization with id ${organization_uuid} not found.`);
        leaveTypePayload.organization_id = organization.id;
        const leaveType = await leaveTypeRepository.createLeaveType(leaveTypePayload, transaction);

        const applicableFor = leaveType.getApplicableFor();

        const criteria = {};
        if (applicableFor.value === 'all') {
            criteria.organization_id = organization.id;
        } else if (applicableFor.type === 'role') {
            criteria.organization_role_uuids = applicableFor.value;
        } else {
            criteria.user_uuids = applicableFor.value;
        }

        const userIds = await userRepository.getUserIdsByCriteria(criteria, transaction);
        const leaveBalances = userIds.map(id => ({
            user_id: id,
            leave_type_id: leaveType.id,
            balance: leaveType.getLeaveCount(),
            leaves_allocated: leaveType.getLeaveCount(),
        }))

        const data = await leaveBalanceRepository.bulkCreateLeaveBalances(leaveBalances, transaction);

        await transactionRepository.commitTransaction(transaction);
        return leaveType;
    } catch (error) {
        await transactionRepository.rollbackTransaction(transaction);
        throw error;
    }
};

exports.getLeaveTypeById = async (payload) => {
    const { leave_type_uuid } = payload.params;
    return leaveTypeRepository.getLeaveTypeById(leave_type_uuid);
};

exports.updateLeaveTypeById = async (payload) => {
    const { leave_type_uuid } = payload.params;
    const leaveType = payload.body;
    const [, [response]] = await leaveTypeRepository.updateLeaveTypeById(leave_type_uuid, leaveType);
    return response;
};
