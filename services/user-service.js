const organizationService = require("./organization-service");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../middleware/error");
const { attendanceRepository } = require("../repositories/attendance-repository");
const { departmentRepository } = require("../repositories/department-repository");
const { leaveBalanceRepository } = require("../repositories/leave-balance-repository");
const { leaveTypeRepository } = require("../repositories/leave-type-repository");
const { organizationRoleRepository } = require("../repositories/organization-role-repository");
const { roleRepository } = require("../repositories/role-repository");
const { transactionRepository } = require("../repositories/transaction-repository");
const { userRepository } = require("../repositories/user-repository");
const { organizationHolidayRepository } = require("../repositories/organisation-holiday-repository");
const { leaveRequestRepository } = require("../repositories/leave-request-repository");
const { userPersonalDataRepository } = require("../repositories/user-personal-data-repository");
const { convertPathToIdentifier, saveData } = require("../middleware/save-in-redis-middleware");
const UserBuilder = require("../redis/user/user-builder");
const { convertToRedisKey } = require("../redis/common/common-functions");
const { saveInRedis } = require("../redis/common/redis-setter");
const OrganizationBuilder = require("../redis/organization/organization-builder");
const OrganizationRoleBuilder = require("../redis/organization_role/organization-role-builder");
const RoleBuilder = require("../redis/role/role-builder");

exports.validateQueryParameters = async (payload) => {
    let { date_range, organization_uuid } = payload.query;

    if (date_range && !Array.isArray(date_range)) {
        payload.query.date_range = date_range.split(',');
    }

    return payload;
}

exports.getFilteredUsers = async (payload) => {
    let { status, email = "", archive = false, page = 1, limit = 10, organization_uuid, role_uuid, department_uuid, child_uuid } = payload.query;

    const redis_user = new UserBuilder();
    const key = convertToRedisKey(payload.originalUrl);

    try {
        let redis_response = await redis_user.getBulk(key);
        if (redis_response && Object.keys(redis_response).length > 0) {
            return redis_response;
        }
    } catch (error) {
        console.log(error);
    }

    const response = await userRepository.getFilteredUsers({ email, status, organization_uuid, role_uuid, department_uuid, child_uuid }, { archive, page, limit });
    await saveInRedis(JSON.stringify(response), payload.originalUrl);
    return response;
}

exports.getUserById = async (payload) => {
    const { user_uuid } = payload.params;

    try {
        const user = new UserBuilder()
        const organization = new OrganizationBuilder();
        const organization_role = new OrganizationRoleBuilder();
        const role = new RoleBuilder();

        user.withOrganization(organization);
        organization_role.withRole(role);
        user.withOrganizationRole(organization_role);

        const key = convertToRedisKey(payload.originalUrl);

        const redis_response = await user.get(key);
        if (redis_response && Object.keys(redis_response).length > 0 && !Object.values(redis_response).includes(null)) {
            return redis_response;
        }
    }catch(error) {
        console.log(error);
    }

    const response = await userRepository.getUserById(user_uuid);
    await saveInRedis(JSON.stringify(response), payload.originalUrl);
    return response;
}

exports.createUser = async (payload) => {
    const { department_uuid, organization_role_uuid } = payload.body;
    const userPayload = {
        name: payload.body.name,
        email: payload.body.email,
        status: payload.body.status,
        password: payload.body.password,
        parent_id: payload.body.parent_id,
        phone_number: payload.body.phone_number,
        personal_email: payload.body.personal_email,
        date_of_joining: payload.body.date_of_joining,
        profile_image: {
            name: payload.body?.profile_image?.name,
            url: payload.body?.profile_image?.url,
            size: payload.body?.profile_image?.size
        },
        personal_detail: {
            parent_information: payload.body?.personal_detail?.parent_information,
            emergency_contact: payload.body?.personal_detail?.emergency_contact,
            dob: payload.body?.personal_detail?.dob,
            blood_group: payload.body?.personal_detail?.blood_group,
            marital_status: payload.body?.personal_detail?.marital_status,
            current_address: payload.body?.personal_detail?.current_address,
            permanent_address: payload.body?.personal_detail?.permanent_address,
            gender: payload.body?.personal_detail?.gender,
        }
    }

    const transaction = await transactionRepository.startTransaction();
    try {
        const organizationRole = await organizationRoleRepository.getOrganizationRoleByUUID(organization_role_uuid, transaction);
        if (!organizationRole) {
            throw new NotFoundError("Organization role not found", "Organization role with provided uuid not found");
        }
        const department = await departmentRepository.getDepartmentById(department_uuid, transaction);

        if (!department) {
            throw new NotFoundError("Department not found", "Department with provided uuid not found");
        }

        if (department.organization_id !== organizationRole.organization_id) {
            throw new BadRequestError("Invalid department or role", "Department and Role does not belong to the same organization");
        }

        userPayload.organization_role_id = organizationRole.id;
        userPayload.organization_id = organizationRole.organization_id;
        userPayload.department_id = department.id;

        if (!userPayload.profile_image.url) {
            userPayload.profile_image = {
                name: "stock_image",
                url: `https://dummyjson.com/image/200x200/008080/ffffff?text=${payload.body.name?.trimStart().charAt(0)}`,
                size: 2
            }
        }

        const user = await userRepository.createUser(userPayload, transaction);

        const leaveTypes = await leaveTypeRepository.getLeaveTypesByOrganizationRoleUUID(payload.body.organization_role_uuid, transaction);

        const leaveBalancesPayload = leaveTypes.map((leaveType) => ({
            user_id: user.id,
            leave_type_id: leaveType.id,
            balance: leaveType.getLeaveCount(),
            leaves_allocated: leaveType.getLeaveCount(),
        }));

        await leaveBalanceRepository.bulkCreateLeaveBalances(leaveBalancesPayload, transaction);

        //redis code
        //    const redis_key = convertPathToIdentifier(payload.originalUrl);
        await saveData(JSON.stringify(user), user.user_id);

        await transactionRepository.commitTransaction(transaction);
        return user;

    } catch (error) {
        await transactionRepository.rollbackTransaction(transaction);
        throw error;
    }
}

exports.updateUserById = async (payload) => {
    const { user_uuid } = payload.params;

    const user = await userRepository.getUserById(user_uuid);
    if (!(user.isActive() && user.organization.isActive() && user.department.isActive() && user.organization_role?.isActive())) throw new ForbiddenError('User is currently inactive.');

    const [affectedRows, response] = await userRepository.updateUserById(user_uuid, payload.body);
    console.log(response[0]);
    if (affectedRows) {
        await saveData(JSON.stringify(response[0]), response[0].user_id);
        return response[0];
    }
    else return null;
}

exports.activateUser = async (payload) => {
    const { user_uuid } = payload.params

    const user = await userRepository.getUserById(user_uuid)

    if (!user) throw new NotFoundError("User not found", "User with provided uuid not found")

    user.activate();

    const response = await user.save();
    await saveData(JSON.stringify(response), response.user_id);
    return response;
}

exports.deactivateUser = async (payload) => {
    const { user_uuid } = payload.params

    const user = await userRepository.getUserById(user_uuid)

    if (!user) throw new NotFoundError("User not found", "User with provided uuid not found")

    user.deactivate();

    const response = await user.save();
    console.log(response);
    await saveData(JSON.stringify(response), response.user_id);
    return response;
}

// exports.updateLeaveBalanceOfUser = async (payload) => {
//     const { user_uuid } = payload.params
//     const { leave_type_uuid, increase_balance_by = 0, sla } = payload.body;

//     if (increase_balance_by < 0) {
//         throw new BadRequestError("Invalid value", "Increase by value should be greater than 0");
//     }

//     const response = await userRepository.getUserById(user_uuid, false);

//     if (!response) {
//         throw new NotFoundError("User not found", "User with provided uuid not found")
//     }

//     const leaveBalance = await leaveBalanceRepository.getLeaveBalanceByUserIdAndLeaveTypeUUID(response.id, leave_type_uuid);

//     if (!leaveBalance) {
//         throw new NotFoundError("Leave balance not found", "Leave balance with provided user and leave type not found");
//     }

//     if (sla) {
//         leaveBalance.setSpecialLeaveAllowance(sla);
//     }
//     if (increase_balance_by !== 0) {
//         leaveBalance.increment('balance', { by: increase_balance_by });
//     }

//     return leaveBalance.save();
// }

exports.verifyUser = async (payload) => {
    const { email, password } = payload.body
    const user = await userRepository.findOne({ email: email })

    if (!user) {
        throw new NotFoundError("User not found", "User with provided email not found")
    }

    if (!(user.isActive() && user.organization.isActive() && user.department.isActive() && user.organization_role?.isActive())) throw new ForbiddenError('User is currently inactive.');


    const isVerified = await user.verifyPassword(password);

    if (!isVerified) {
        throw new BadRequestError("Invalid credentials", "Invalid email or password")
    }

    return user;
};

exports.updatePassword = async (payload) => {
    const { user_uuid } = payload.params
    const { password } = payload.body

    const user = await userRepository.getUserById(user_uuid);
    if (!(user.isActive() && user.organization.isActive() && user.department.isActive() && user.organization_role?.isActive())) throw new ForbiddenError('User is currently inactive.');

    if (!user) {
        throw new NotFoundError("User not found", "User with provided id not found")
    }

    await user.updatePassword(password);
    return user.save()
}

exports.getLeaveBalanceOfUser = async (payload) => {
    const { user_uuid } = payload.params;
    const reponse = await leaveBalanceRepository.getLeaveBalancesOfUserByUserUUID(user_uuid);
    return reponse;
}

exports.updateLeaveBalanceOfUser = async (payload) => {
    const { user_uuid, leave_type_uuid } = payload.params;
    const { sla, increase_balance_by } = payload.body;

    const user = await userRepository.getUserById(user_uuid);
    if (!(user.isActive() && user.organization.isActive() && user.department.isActive() && user.organization_role?.isActive())) throw new ForbiddenError('User is currently inactive.');

    if (increase_balance_by && increase_balance_by < 0) {
        throw new BadRequestError("Invalid value", "Increase by value should be greater than 0");
    }

    const response = await leaveBalanceRepository.updateLeaveBalanceByUUIDS({ user_uuid, leave_type_uuid }, { balance });
    return response;
}


exports.getAttendanceReport = async (payload) => {
    payload = await this.validateQueryParameters(payload);
    let { date_range, status, organization_uuid } = payload.query;
    const { user_uuid } = payload.params;
    if (!date_range) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const start_date = startOfMonth.toISOString().slice(0, 10);
        const end_date = today.toISOString().slice(0, 10);

        payload.query.date_range = [start_date, end_date];
    }

    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 6);

    const userTotalHours = await attendanceRepository.getTotalHours({ user_uuid, date_range: [pastDate, today] });

    const organizationAffectedHours = await organizationService.getAvarageWorkingHours({ organization_uuid, date_range: [pastDate, today] });;
    const holidaysCount = await organizationHolidayRepository.getHolidaysCount({ organization_uuid, date_range: [pastDate, today] });
    // const leavesCount = await leaveRequestRepository.getApprovedLeaveRequestCount({user_uuid, date_range: [pastDate, today]});

    // totalWorkingDaysOfUser= totalWorkingDaysOfOrganization-holidaysCount-leaveCount;
    const totalWorkingDaysOfUser = 7 - holidaysCount;
    const totalWorkingDaysOfOrganization = 7 - holidaysCount;

    const status_response = await attendanceRepository.getAttendanceStatus({ user_uuid, date_range, status });
    const status_count = new Map();
    await Promise.all(status_response.map(response => {
        if (status_count.has(response.status)) {
            status_count.set(response.status, status_count.get(response.status) + 1);
        } else {
            status_count.set(response.status, 1);
        }
    }));
    const affected_hours = await attendanceRepository.getAttendanceAffectedHours({ user_uuid, date_range: [pastDate, today] });
    const status_count_obj = Object.fromEntries(status_count);

    return {
        status_count: status_count_obj,
        affected_hours,
        avarage: {
            user: parseFloat((userTotalHours / totalWorkingDaysOfUser).toFixed(2)),
            organization: parseFloat((organizationAffectedHours / totalWorkingDaysOfOrganization).toFixed(2))
        }
    };
}

exports.getLeaveReport = async (payload) => {
    payload = await this.validateQueryParameters(payload);
    const { date_range } = payload.query;
    const user_uuid = payload.params.user_uuid;

    const monthly_attendance_count = await userRepository.getAttendanceMonthly({ user_uuid, date_range });

    const monthly_leave_count = await userRepository.getLeaveReport(user_uuid, date_range);
    return { monthly_attendance_count, monthly_leave_count };
}

exports.updateUserPersonalDetails = async (payload) => {
    const { user_uuid } = payload.params;
    const payloadBody = payload.body;

    const user = await userRepository.getUserById(user_uuid);
    if (!(user.isActive() && user.organization.isActive() && user.department.isActive() && user.organization_role?.isActive())) throw new ForbiddenError('User is currently inactive.');

    return userPersonalDataRepository.updateUserPersonalDetailsById(user.id, payloadBody);
}