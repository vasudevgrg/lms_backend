const {
  organizationRepository,
} = require("../repositories/organization-repository");
const { userRepository } = require("../repositories/user-repository");
const {
  organizationRoleRepository,
} = require("../repositories/organization-role-repository");
const { NotFoundError, ForbiddenError } = require("../middleware/error");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const {
  permissionRepository,
} = require("../repositories/permission-repository");
const { ShiftType } = require("../models/role/shift-type-enum");
const {
  rolePermissionRepository,
} = require("../repositories/role-permission-repository");
const {
  attendanceRepository,
} = require("../repositories/attendance-repository");
const { roleRepository } = require("../repositories/role-repository");
const { organizationHolidayRepository } = require("../repositories/organisation-holiday-repository");
const { holidayRepository } = require("../repositories/holiday-repository");
const { AttendanceStatus } = require("../models/attendance/attendance-status-enum");
const { Permission } = require("../models/common/permission-enum");
const { Action } = require("../models/common/action-enum");
const OrganizationBuilder = require("../redis/organization/organization-builder");
const { convertToRedisKey } = require("../redis/common/common-functions");
const { saveInRedis, saveData } = require("../redis/common/redis-setter");
const OrganizationHolidayBuilder = require("../redis/holiday/organization-holiday-builder");
const HolidayBuilder = require("../redis/holiday/holiday-builder");

exports.validatingQueryParameters = async (payload) => {
  let { order, order_column, date_range } = payload.query;

  if (date_range && !Array.isArray(date_range)) {
    payload.query.date_range = date_range.split(",");
  }

  // Validate and adjust order parameter
  if (
    order &&
    !(order.toLowerCase() === "asc" || order.toLowerCase() === "desc")
  )
    payload.query.order = "DESC";
  else payload.query.order = order?.toUpperCase() || "DESC";

  // Validate and adjust order_column parameter against available columns
  const columns = await organizationRepository.allColumnsName();
  if ((order_column && !columns[order_column]) || !order_column) {
    payload.query.order_column = "updated_at";
  }

  return payload;
};

exports.createOrganization = async (payload) => {
  const organizationPayload = {
    name: payload.body.name,
    domain: payload.body.domain,
  };
  const transaction = await transactionRepository.startTransaction();
  try {
    const organization = await organizationRepository.createOrganization(
      organizationPayload,
      transaction
    );
    const permissionData = await permissionRepository.getAllPermissions();
    const userPayload = {
      name: payload.body.name,
      email: payload.body.email,
      password: payload.body.password,
      phone_number: payload.body.phone_number,
      date_of_joining: new Date(),
      organization_id: organization.id,
      department: {
        name: "Organization",
        description: "Organization Department",
        organization_id: organization.id,
      },
      user_role: {
        role_id: 3, // 2 is the default role for organization
        organization_id: organization.id,
        shift_type: ShiftType.ENUM.DAY,
        role_permissions: permissionData.map((permission) => ({
          permission_id: permission.id,
          action:
            permission.value === Permission.ENUM.ORGANIZATION_MANAGEMENT
              ? permission.actions.filter((action) => action !== Action.ENUM.CREATE)
              : permission.actions
        })),
      },
    };
    const user = await userRepository.createUser(userPayload, transaction);

    await saveData(JSON.stringify(organization), organization.uuid);
    await saveData(JSON.stringify(user), user.user_id);

    await transactionRepository.commitTransaction(transaction);
    return organization;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.getFilteredOrganizations = async (payload) => {
  payload = await this.validatingQueryParameters(payload);
  let { page = 1, limit = 10, order, order_column } = payload.query;

  const redis_organization = new OrganizationBuilder();
  redis_organization.withUsers();
  const key = formatRedisKey(req.originalUrl);

  try {
    let redis_response = await redis_organization.getBulk(key);
    if (redis_response && Object.keys(redis_response).length > 0) {
      return redis_response;
    }
  } catch (error) {
    console.log(error);
  }

  const response = await organizationRepository.getFilteredOrganizations({
    order_type: order,
    order_column,
    page,
    limit,
  });

  await saveInRedis(response, payload.originalUrl);
  return response;
};

exports.getOrganizationById = async (payload) => {
  const { organization_uuid } = payload.params;

  const redis_organization = new OrganizationBuilder();
  const key = convertToRedisKey(payload.originalUrl);

  try {
    let response = await redis_organization.get(key);
    if (response && Object.keys(response).length > 0) {
      return response;
    }

  } catch (error) {
    console.log(error);
  }

  const organization = await organizationRepository.getOrganizationById(organization_uuid);
  await saveData(JSON.stringify(organization), organization.uuid);
  return organization;
};

exports.updateOrganizationById = async (payload) => {
  const { organization_uuid } = payload.params;
  const { name, domain } = payload.body;
  const organizationData = { name, domain };

  const organization = await organizationRepository.getOrganizationById(
    organization_uuid
  );
  if (!organization.isActive())
    throw new ForbiddenError("Organization is currently inactive.");

  const response = await organizationRepository.updateOrganizationById(
    organization_uuid,
    organizationData
  );

  if (response) {
    await saveData(JSON.stringify(response), response.uuid);
    return organizationRepository.getOrganizationById(organization_uuid);
  }
  return null;
};

exports.getOrganizationRoles = async (payload) => {
  const { organization_uuid } = payload.params;
  return organizationRoleRepository.getOrganizationRolesByOrganizationUUID(
    organization_uuid
  );
};

exports.addOrganizationRole = async (payload) => {
  const { organization_uuid } = payload.params;
  const { role_uuid, name, description, shift_type } = payload.body;

  const organization = await organizationRepository.getOrganizationById(
    organization_uuid
  );
  if (!organization.isActive())
    throw new ForbiddenError("Organization is currently inactive.");

  const organizationRole = {
    shift_type,
    organization_id: organizationRoleRepository.getLiteralFrom(
      "organization",
      organization_uuid
    ),
  };

  if (role_uuid)
    organizationRole.role_id = organizationRepository.getLiteralFrom(
      "role",
      role_uuid
    );
  else organizationRole.role = { name, description };

  return organizationRoleRepository.createOrganizationRole(organizationRole);
};

exports.getOrganizationRoleByIds = async (payload) => {
  const { organization_uuid, role_uuid } = payload.params;
  return organizationRoleRepository.getOrganizationRoleByIds(
    organization_uuid,
    role_uuid
  );
};

exports.bulkAddOrganizationRoles = async (payload) => {
  const { organization_uuid } = payload.params;

  const organization = await organizationRepository.getOrganizationById(
    organization_uuid
  );
  if (!organization.isActive())
    throw new ForbiddenError("Organization is currently inactive.");

  const roles = payload.body.map(async (role) => {
    const curr_role = await roleRepository.getRoleById(role.role_uuid);
    if (!curr_role.isActive())
      throw new ForbiddenError("Role is currently inactive.");
    return {
      shift_type: role.shift_type,
      organization_id: organizationRoleRepository.getLiteralFrom(
        "organization",
        organization_uuid
      ),
      role_id: organizationRepository.getLiteralFrom("role", role.role_uuid),
    };
  });
  return organizationRoleRepository.bulkCreateOrganizationRoles(roles);
};

exports.updateOrganizationRoleByIds = async (payload) => {
  const { organization_uuid, role_uuid } = payload.params;

  const organization = await organizationRepository.getOrganizationById(
    organization_uuid
  );
  if (!organization) throw new NotFoundError("Organization not founf");
  if (!organization.isActive())
    throw new ForbiddenError("Organization is currently inactive.");

  const organizationRole =
    await organizationRoleRepository.getOrganizationRoleByIds(
      organization_uuid,
      role_uuid
    );
  if (!organizationRole)
    throw new NotFoundError(
      "Organization Role not found",
      `Organization Role  with organization uuid: ${organization_uuid} and role UUID: ${role_uuid} not found`
    );

  if (!organizationRole.isActive()) throw new ForbiddenError("Role is currently inactive.");

  return organizationRoleRepository.updateOrganizationRoleByIds(
    organization_uuid,
    role_uuid,
    payload.body
  );
};

exports.updateOrganizationRolePermissions = async (payload) => {
  const { organization_uuid, role_uuid } = payload.params;

  const organization = await organizationRepository.getOrganizationById(
    organization_uuid
  );
  if (!organization.isActive())
    throw new ForbiddenError("Organization is currently inactive.");

  const organizationRole = await organizationRoleRepository.getOrganizationRoleByIds(
    organization_uuid,
    role_uuid
  );

  if (!organizationRole)
    throw new NotFoundError(
      "Organization Role not found",
      `Organization Role  with organization uuid: ${organization_uuid} and role UUID: ${role_uuid} not found`
    );
  if (!organizationRole.isActive()) throw new ForbiddenError("Role is currently inactive.");

  const permissions = payload.body.map((permission) => {
    return {
      organization_role_id: organizationRole.id,
      permission_id: rolePermissionRepository.getLiteralFrom(
        "permission",
        permission.permission_uuid
      ),
      action: permission.action,
    };
  });
  return rolePermissionRepository.bulkCreateRolePermissions(permissions);
};

exports.getAvarageWorkingHours = async (payload) => {
  const { organization_uuid, date_range } = payload;
  const users = await userRepository.getUsersCount(organization_uuid);
  const sum = await attendanceRepository.getTotalHours({
    organization_uuid,
    date_range,
  });
  const totalUsers = users[0].toJSON().count;

  if (!sum[0]) {
    return 0.0;
  }
  const avg = sum / totalUsers;
  return avg.toFixed(2);
};

exports.getOrganizationLeaveReport = async (payload) => {
  payload = await this.validatingQueryParameters(payload);

  const { organization_uuid } = payload.params;
  const { date_range } = payload.query;

  const organization = await organizationRepository.getOrganizationById(
    organization_uuid
  );
  if (!organization) {
    throw new NotFoundError(
      "Organization not found.",
      `Organization with id ${organization_uuid} not found.`
    );
  }

  // const [start_date, end_date] = date_range;
  // const total_leaves = [];

  // let currentDate = new Date(start_date);
  // const endDate = new Date(end_date);

  // while (currentDate <= endDate) {
  //     const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  //     const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  //     const monthlyLeaveCount = await organizationRepository.getLeaveReport(organization_uuid, [
  //        monthStart.toISOString(), monthEnd.toISOString()
  //     ]);
  //     total_leaves.push({
  //         month: (currentDate.getMonth() + 1).toString().padStart(2, '0') + '-' + currentDate.getFullYear(),
  //         leave_types:monthlyLeaveCount
  //     });

  //     currentDate.setMonth(currentDate.getMonth() + 1);
  // }

  const total_leaves = await organizationRepository.getLeavesCount(
    organization_uuid,
    date_range
  );
  const leave_types = await organizationRepository.getLeaveTypesCount(
    organization_uuid,
    date_range
  );

  return {
    total_leaves_per_month: total_leaves,
    total_leaves_per_leave_type: leave_types,
  };
};

exports.activateOrganization = async (payload) => {
  const { organization_uuid } = payload.params;

  const organization = await organizationRepository.getOrganizationById(
    organization_uuid
  );
  if (!organization) throw new NotFoundError("Organization not found");

  const response = await organization.activate();
  await saveData(JSON.stringify(response), response.uuid);

  return organization.save();
};

exports.deactivateOrganization = async (payload) => {
  const { organization_uuid } = payload.params;

  const organization = await organizationRepository.getOrganizationById(
    organization_uuid
  );
  if (!organization) throw new NotFoundError("Organization not found");

  const response = await organization.deactivate();
  await saveData(JSON.stringify(response), response.uuid);

  return organization.save();
};

exports.activateOrganizationRole = async (payload) => {
  const { organization_uuid, role_uuid } = payload.params;

  const organization = await organizationRepository.getOrganizationById(
    organization_uuid
  );
  if (!organization) throw new NotFoundError("Organization not found");

  const organizationRole =
    await organizationRoleRepository.getOrganizationRoleByIds(
      organization_uuid,
      role_uuid
    );
  if (!organizationRole) throw new NotFoundError("Organization Role not found");

  const response = await organizationRole.activate();
  await saveData(JSON.stringify(response), response.uuid);


  return organizationRole.save();
};

exports.deactivateOrganizationRole = async (payload) => {
  const { organization_uuid, role_uuid } = payload.params;

  const organization = await organizationRepository.getOrganizationById(
    organization_uuid
  );
  if (!organization) throw new NotFoundError("Organization not found");

  const organizationRole =
    await organizationRoleRepository.getOrganizationRoleByIds(
      organization_uuid,
      role_uuid
    );
  if (!organizationRole) throw new NotFoundError("Organization Role not found");

  const response = await organizationRole.deactivate();
  await saveData(JSON.stringify(response), response.uuid);

  return organizationRole.save();
};

exports.createOrganizationHoliday = async (payload) => {
  const { organization_uuid } = payload.params;
  const { holiday_uuid } = payload.body;

  const organization = await organizationRepository.getOrganizationById(organization_uuid);
  if (!organization.isActive()) throw new ForbiddenError('Organization is currently inactive.');

  const transaction = await transactionRepository.startTransaction();
  try {
    const organizationHoliday = await organizationHolidayRepository.createOrganizationHoliday({ organization_uuid, holiday_uuid }, transaction);
    const holiday = await holidayRepository.getHolidayById(holiday_uuid);
    const users = await userRepository.getUserIdsByCriteria({ organization_id: organizationHoliday.organization_id });
    const payload = [];

    await Promise.all(users.map(user_id => {
      const data = {
        user_id,
        status: AttendanceStatus.ENUM.HOLIDAY,
        check_in: "09:00:00",
        check_out: "18:00:00",
        date: holiday.date_observed
      }
      payload.push(data);
    }));
    const response = await attendanceRepository.bulkCreateAttendances(payload, transaction);
    await transactionRepository.commitTransaction(transaction);
    return response;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
}

exports.bulkCreateOrganizationHolidays = async (payload) => {
  const { organization_uuid } = payload.params;
  const holiday_uuids = payload.body;
  const data = [];
  await holiday_uuids.map((holiday_uuid) => {
    data.push({
      organization_id: organizationRepository.getLiteralFrom('organization', organization_uuid),
      holiday_id: holidayRepository.getLiteralFrom('holiday', holiday_uuid)
    })
  });

  return organizationHolidayRepository.bulkCreateOrganizationHoliday(data);

}

exports.getFilteredOrganizationHoliday = async (payload) => {
  const { organization_uuid } = payload.params;
  const { date_range, holiday_uuid } = payload.query;

  try {
    const organization_holiday = new OrganizationHolidayBuilder();
    const holiday = new HolidayBuilder();

    organization_holiday.withHoliday(holiday);

    const key = convertToRedisKey(req.originalUrl);
    console.log('key: ', key);
    
    let redis_response = await organization_holiday.getBulkOrganizationHolidays(key);
    if (redis_response && Object.keys(redis_response).length > 0) {
        return redis_response;
    }
  }catch(error) {
    console.log(error);
  }

  const response =await organizationHolidayRepository.getFilteredOrganizationHolidays({ organization_uuid, holiday_uuid, date_range });

  await saveInRedis(response, payload.originalUrl);
  return response;
}

exports.getCountOfWorkingDays = async (payload) => {
  const { date_range, organization_uuid } = payload;
  const [start_date, end_date] = date_range.map(date => new Date(date));
  const holidays = await organizationHolidayRepository.getFilteredOrganizationHolidays({ organization_uuid, date_range });
  const generalWorkingDays = getWorkingDays(start_date, end_date);
  return generalWorkingDays - holidays.count;
}

exports.activateOrganizationHoliday = async (payload) => {
  const { organization_uuid, holiday_uuid } = payload.params;

  const organizationHoliday = await organizationHolidayRepository.getOrganizationHolidayByIds(organization_uuid, holiday_uuid);
  if (!organizationHoliday) throw new NotFoundError("Organization Holiday Not found");

  organizationHoliday.activate();

  return organizationHoliday.save();
}

exports.deactivateOrganizationHoliday = async (payload) => {
  const { organization_uuid, holiday_uuid } = payload.params;

  const organizationHoliday = await organizationHolidayRepository.getOrganizationHolidayByIds(organization_uuid, holiday_uuid);
  if (!organizationHoliday) throw new NotFoundError("Organization Holiday Not found");

  organizationHoliday.deactivate();

  return organizationHoliday.save();
}