const { NotFoundError, BadRequestError } = require("../middleware/error");
const {
  AttendanceStatus,
} = require("../models/attendance/attendance-status-enum");
const { isValidDate, isValidUUID } = require("../models/common/validator");
const {
  LeaveRequestStatus,
} = require("../models/leave/leave-request-status-enum");
const {
  attendanceRepository,
} = require("../repositories/attendance-repository");
const {
  leaveBalanceRepository,
} = require("../repositories/leave-balance-repository");
const {
  leaveRequestManagerRepository
} = require("../repositories/leave-request-manager-repository");
const {
  leaveRequestRepository,
} = require("../repositories/leave-request-repository");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const { userRepository } = require("../repositories/user-repository");
const { updateLeaveBalanceOfUser } = require("./user-service");

exports.validatingQueryParameters = async (payload) => {
  let {
    user_uuid,
    leave_type_uuid,
    manager_uuid,
    organization_uuid,
    date,
    start_date,
    end_date,
    department_uuid,
    status,
    archive = false,
  } = payload.query;

  // Convert archive string to a boolean
  if (archive === "true" || archive === true) payload.query.archive = true;
  else payload.query.archive = false;

  // Convert date string to a date object
  if (date && !isValidDate(date))
    throw new BadRequestError(
      "Invalid date.",
      "Date parameter is not a valid date string."
    );
  if (date) payload.query.date = new Date(date);

  // Convert start_date string to a date object
  if (start_date && !isValidDate(start_date))
    throw new BadRequestError(
      "Invalid start date.",
      "Start date parameter is not a valid date string."
    );
  if (start_date) payload.query.start_date = new Date(start_date);
  else payload.query.start_date = new Date(new Date().getFullYear(), 0, 1);

  // Convert end_date string to a date object
  if (end_date && !isValidDate(end_date))
    throw new BadRequestError(
      "Invalid end date.",
      "End date parameter is not a valid date string."
    );
  if (end_date) payload.query.end_date = new Date(end_date);
  else payload.query.end_date = new Date(+new Date().getFullYear() + 1, 0, 1);

  if (user_uuid && !isValidUUID(user_uuid))
    throw new BadRequestError(
      "Invalid user uuid.",
      "User uuid is not a valid uuid string."
    );

  if (leave_type_uuid && !isValidUUID(leave_type_uuid))
    throw new BadRequestError(
      "Invalid leave type uuid.",
      "Leave type uuid is not a valid uuid string."
    );

  if (manager_uuid && !isValidUUID(manager_uuid))
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is not a valid uuid string."
    );

  if (organization_uuid && !isValidUUID(organization_uuid))
    throw new BadRequestError(
      "Invalid organization uuid.",
      "Organization uuid is not a valid uuid string."
    );

  if (department_uuid && !isValidUUID(department_uuid))
    throw new BadRequestError(
      "Invalid department uuid.",
      "Department uuid is not a valid uuid string."
    );

  if (status && !LeaveRequestStatus.isValidValue(status))
    throw new BadRequestError(
      "Invalid status.",
      "Status parameter is not a valid status string."
    );

  return payload;
};

exports.getFilteredLeaveRequests = async (payload) => {
  payload = await this.validatingQueryParameters(payload);
  let {
    user_uuid,
    leave_type_uuid,
    manager_uuid,
    organization_uuid,
    date,
    date_range,
    department_uuid,
    status,
    archive = false,
    page = 1,
    limit = 10,
  } = payload.query;

  if(!(leave_type_uuid || manager_uuid || department_uuid || user_uuid || organization_uuid)) throw new BadRequestError("Organization UUID not found");
  return leaveRequestRepository.getFilteredLeaveRequests(
    {
      user_uuid,
      leave_type_uuid,
      manager_uuid,
      organization_uuid,
      date,
      date_range,
      department_uuid,
      status,
    },
    { archive, page, limit }
  );
};

exports.createLeaveRequest = async (payload) => {
  const leaveBalance = await leaveBalanceRepository.getLeaveBalanceByUUIDS(
    payload.body.user_uuid,
    payload.body.leave_type_uuid
  );

  const user = await userRepository.getUserById(payload.body.user_uuid);
  if (!(user.isActive() && user.organization.isActive() && user.department.isActive() && user.organization_role?.isActive())) throw new ForbiddenError('User is currently inactive.');

  if (!leaveBalance)
    throw new NotFoundError(
      "Leave balance not found.",
      "User do not have any leave balance alloted from this type."
    );
  const leaveDuration =
    await leaveRequestRepository.model.calculateLeaveDuration(payload.body);
  if (
    leaveDuration >
    leaveBalance.balance + (leaveBalance.sla ? +leaveBalance.sla : 0)
  )
    throw new BadRequestError(
      "Insufficient leave balance.",
      "User do not have enough leave balance to apply for this leave request."
    );

  if (!payload.body.managers || payload.body.managers?.length === 0)
    throw new BadRequestError(
      "No managers found.",
      "Please provide at least one manager to approve this leave request."
    );
  if (payload.body.managers?.some((manager) => !isValidUUID(manager)))
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is not a valid uuid string."
    );
  if (
    payload.body.managers?.find((manager) => manager === payload.body.user_uuid)
  )
    throw new BadRequestError(
      "Invalid manager.",
      "User cannot be a manager of his/her own leave request."
    );

  return leaveRequestRepository.createLeaveRequest(payload.body);
};

exports.getLeaveRequestByUUID = async (payload) => {
  const { leave_request_uuid } = payload.params;
  return leaveRequestRepository.getLeaveRequestByUUID(leave_request_uuid);
};

exports.updateLeaveRequest = async (payload) => {
  const { leave_request_uuid } = payload.params;

  const user = await userRepository.getUserById(payload.body.user_uuid);
  if (!(user.isActive() && user.organization.isActive() && user.department.isActive() && user.organization_role?.isActive())) throw new ForbiddenError('User is currently inactive.');

  const transaction = await transactionRepository.startTransaction();
  try {
    const leaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
      leave_request_uuid,
      transaction
    );
    if (!leaveRequest)
      throw new NotFoundError(
        "Leave request not found.",
        "Leave request with provided id not found."
      );

    if (!leaveRequest.isPending())
      throw new BadRequestError(
        "Invalid leave request status.",
        "Leave request is not in pending status. Only pending leave requests can be updated."
      );

    const leaveBalance = await leaveBalanceRepository.getLeaveBalanceByUUIDS(
      payload.body.user_uuid,
      payload.body.leave_type_uuid,
      transaction
    );
    if (!leaveBalance)
      throw new NotFoundError(
        "Leave balance not found.",
        "User do not have any leave balance alloted from this type."
      );
    const leaveDuration =
      await leaveRequestRepository.model.calculateLeaveDuration(payload.body);
    if (
      leaveDuration >
      leaveBalance.balance + (leaveBalance.sla ? +leaveBalance.sla : 0)
    )
      throw new BadRequestError(
        "Insufficient leave balance.",
        "User do not have enough leave balance to apply for this leave request."
      );

    if (!payload.body.managers || payload.body.managers?.length === 0)
      throw new BadRequestError(
        "No managers found.",
        "Please provide at least one manager to approve this leave request."
      );
    if (payload.body.managers?.some((manager) => !isValidUUID(manager)))
      throw new BadRequestError(
        "Invalid manager uuid.",
        "Manager uuid is not a valid uuid string."
      );

    if (
      payload.body.managers?.find(
        (manager) => manager === payload.body.user_uuid
      )
    )
      throw new BadRequestError(
        "Invalid manager.",
        "User cannot be a manager of his/her own leave request."
      );
    leaveRequest.managers.forEach((manager) => {
      if (!payload.body?.managers?.includes(manager.user.user_id))
        manager.destroy({ transaction });
    });
    await leaveRequestManagerRepository.bulkCreateLeaveRequestManagers(
      leaveRequest.id,
      payload.body.managers,
      { transaction }
    );
    const leaveRequestRes = await leaveRequestRepository.updateLeaveRequestById(
      leave_request_uuid,
      payload.body,
      transaction
    );
    await transactionRepository.commitTransaction(transaction);
    return leaveRequestRes;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.approveLeaveRequest = async (payload) => {
  const { leave_request_uuid } = payload.params;
  const { manager_uuid, remark } = payload.body;

  if (!manager_uuid)
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is required."
    );
  if (!isValidUUID(leave_request_uuid))
    throw new BadRequestError(
      "Invalid leave request uuid.",
      "Leave request uuid is not a valid uuid string."
    );

  const transaction = await transactionRepository.startTransaction();
  try {
    const leaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
      leave_request_uuid,
      transaction
    );
    if (!leaveRequest)
      throw new NotFoundError(
        "Leave request not found.",
        "Leave request with provided id not found."
      );

    const manager = leaveRequest.managers.find(
      (manager) => manager.user.user_id === manager_uuid
    );
    if (!manager)
      throw new BadRequestError(
        "Invalid manager.",
        "User is not a manager of this leave request."
      );
    manager.setRemark(remark);
    await manager.save({ transaction });

    await leaveRequest.approve(manager.user);
    const response = await leaveRequest.save({ transaction });

    await leaveRequest.leave_balance.deductBalanceBy(
      leaveRequest.leave_duration
    );
    await leaveRequest.leave_balance.save({ transaction });

    const startDate = new Date(leaveRequest.start_date);
    const endDate = new Date(leaveRequest.end_date);
    const payload = [];

    let currDate = new Date(startDate);

    while (currDate < endDate) {
      currDate.setDate(currDate.getDate() + 1);

      payload.push({
        user_id: leaveRequest.user_id,
        date: new Date(currDate),
        status: AttendanceStatus.ENUM.ON_LEAVE,
        check_in: "09:00:00",
        check_out: "18:00:00"
      });
    }

    await attendanceRepository.bulkCreateAttendances(payload, transaction);

    // await attendanceRepository.bulkCreateAttendances(payload, transaction);

    await transactionRepository.commitTransaction(transaction);
    return response;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.recommendLeaveRequest = async (payload) => {
  const { leave_request_uuid } = payload.params;
  const { manager_uuid, remark } = payload.body;

  if (!manager_uuid)
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is required."
    );
  if (!isValidUUID(leave_request_uuid))
    throw new BadRequestError(
      "Invalid leave request uuid.",
      "Leave request uuid is not a valid uuid string."
    );

  const transaction = await transactionRepository.startTransaction();

  try {
    const leaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
      leave_request_uuid
    );
    if (!leaveRequest)
      throw new NotFoundError(
        "Leave request not found.",
        "Leave request with provided id not found."
      );

    const manager = leaveRequest.managers.find(
      (manager) => manager.user.user_id === manager_uuid
    );
    if (!manager)
      throw new BadRequestError(
        "Invalid manager.",
        "User is not a manager of this leave request."
      );
    manager.setRemark(remark);
    await manager.save({ transaction });

    leaveRequest.recommend(manager.user);
    await leaveRequest.save({ transaction });
    await transactionRepository.commitTransaction(transaction);
    return leaveRequest;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.rejectLeaveRequest = async (payload) => {
  const { leave_request_uuid } = payload.params;
  const { manager_uuid, remark } = payload.body;

  if (!manager_uuid)
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is required."
    );
  if (!isValidUUID(leave_request_uuid))
    throw new BadRequestError(
      "Invalid leave request uuid.",
      "Leave request uuid is not a valid uuid string."
    );

  const transaction = await transactionRepository.startTransaction();
  try {
    const leaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
      leave_request_uuid
    );
    if (!leaveRequest)
      throw new NotFoundError(
        "Leave request not found.",
        "Leave request with provided id not found."
      );

    const manager = leaveRequest.managers.find(
      (manager) => manager.user.user_id === manager_uuid
    );
    if (!manager)
      throw new BadRequestError(
        "Invalid manager.",
        "User is not a manager of this leave request."
      );
    manager.setRemark(remark);
    await manager.save({ transaction });

    leaveRequest.reject(manager.user);
    await leaveRequest.save({ transaction });
    await transactionRepository.commitTransaction(transaction);
    return leaveRequest;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.deleteLeaveRequest = async (payload) => {
  const { leave_request_uuid } = payload.params;
  const user = payload.user;

  const leaveRequest = await leaveRequestRepository.getLeaveRequestByUUID(
    leave_request_uuid
  );
  if (!leaveRequest)
    throw new NotFoundError(
      "Leave request not found.",
      "Leave request with provided id not found."
    );

  leaveRequest.cancel(user);
  return leaveRequest.save();
};
