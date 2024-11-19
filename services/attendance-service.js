const { NotFoundError, BadRequestError, ForbiddenError } = require("../middleware/error");
const { AttendanceLogType } = require("../models/attendance/attendance-log-type-enum");
const { AttendanceStatus } = require("../models/attendance/attendance-status-enum");
const { attendanceLogRepository } = require("../repositories/attendance-log-repository");
const { attendanceRepository } = require("../repositories/attendance-repository");
const { userRepository } = require("../repositories/user-repository");
const { transactionRepository } = require("../repositories/transaction-repository");

exports.validateBodyParameters = async (payload) => {
    let { check_in, check_out, attendance_log } = payload.body;

    if (!check_in && check_out) throw BadRequestError("check_in and check_out both required or none of them");
    if(attendance_log && !Array.isArray(attendance_log)) {
        payload.body.attendance_log = attendance_log.split(',');
    }
    return payload;
}

exports.recordUserCheckIn = async (payload) => {
    const { user_uuid } = payload.params;
    const location = payload.headers['x-forwarded-for'] || payload.connection.remoteAddress;
    const user = await userRepository.getUserById(user_uuid);
    if (!user) throw new NotFoundError("User not found", "User with provided uuid not found");
    if (!(user.isActive() && user.organization.isActive() && user.department.isActive() && user.organization_role?.isActive()))
        throw new ForbiddenError('User is currently inactive.');

    const transaction = await transactionRepository.startTransaction();
    try {
        let attendance = await attendanceRepository.getAttendanceByCriteria({ user_uuid, date: new Date() });

        if (attendance) {
            if (attendance.isOnLeaveOrHoliday())
                throw new BadRequestError("Check_In not Allowed", "Contact your administrator")
            if (attendance.isCheckedIn())
                throw new BadRequestError("Already Checked In", "User has already checked in for today");
            else {
                attendance.markCheckIn();
                await attendance.save();
                await attendanceLogRepository.createAttendanceLog({ attendance_id: attendance.id, location, type: AttendanceLogType.ENUM.CHECK_IN }, transaction);
                await transactionRepository.commitTransaction(transaction);
                return attendance;
            }

        } else {
            attendance = await attendanceRepository.createAttendance(user_uuid, transaction);
            await attendanceLogRepository.createAttendanceLog({ attendance_id: attendance[0].id, location, type: AttendanceLogType.ENUM.CHECK_IN }, transaction);
            await transactionRepository.commitTransaction(transaction);
            return attendance;
        }
    } catch (error) {
        await transactionRepository.rollbackTransaction(transaction);
        throw error;
    }
};

exports.recordUserCheckOut = async (payload) => {
    const { user_uuid } = payload.params;
    const location = payload.headers['x-forwarded-for'] || payload.connection.remoteAddress;
    const user = await userRepository.getUserById(user_uuid);
    if (!user) throw new NotFoundError("User not found", "User with provided uuid not found");

    if (!(user.isActive() && user.organization.isActive() && user.department.isActive() && user.organization_role?.isActive())) throw new ForbiddenError('User is currently inactive.');

    const attendance = await attendanceRepository.getAttendanceByCriteria({ user_uuid, date: new Date() });
    if (!attendance) throw new NotFoundError("Attendance not found", "User attendance for today not found");

    if (!attendance.isCheckedOut()) throw new BadRequestError("Already Checked Out", "User has already checked out for today");

    const transaction = await transactionRepository.startTransaction();
    try {
        await attendanceLogRepository.createAttendanceLog({ attendance_id: attendance.id, location, type: AttendanceLogType.ENUM.CHECK_OUT }, transaction);

        attendance.markCheckOut();
        await transactionRepository.commitTransaction(transaction);
        return attendance.save();
    } catch (error) {
        await transactionRepository.rollbackTransaction(transaction);
        throw error;
    }
};

exports.getFilteredAttendance = async (payload) => {
    const { user_uuid, organization_uuid, date, date_range, organization_role_uuid, department_uuid, status, page = 1, limit = 10 } = payload.query;
    return attendanceRepository.getFilteredAttendance({ user_uuid, organization_uuid, date, date_range, organization_role_uuid, department_uuid, status }, { page, limit });
};

exports.recordAttendance = async (payload) => {
    const { user_uuid, date, check_in, check_out, status } = payload.body;
    const location = payload.headers['x-forwarded-for'] || payload.connection.remoteAddress;
    const user = await userRepository.getUserById(user_uuid);

    if (!user) throw new NotFoundError("User not found", "User with provided uuid not found");
    if (!(user.isActive() && user.organization.isActive() && user.department.isActive() && user.organization_role?.isActive())) {
        throw new ForbiddenError('User is currently inactive.');
    }
    if (!check_in) throw new BadRequestError("Invalid Check In", "Check in time is required");

    const transaction = await transactionRepository.startTransaction();
    try {
        const attendance = await attendanceRepository.recordAttendance({ user_uuid, date }, { check_in, check_out, status }, transaction);

        if (status != AttendanceStatus.ENUM.ABSENT || (attendance.isOnLeaveOrHoliday() && (check_in || check_out))) {
            await attendanceLogRepository.recordAttendanceLog({
                attendance_id: attendance[0].id,
                location,
                updates: { check_in, check_out }
            }, transaction);
        }

        await transactionRepository.commitTransaction(transaction);
        return attendance;
    } catch (error) {
        if (!transaction.finished) {
            await transactionRepository.rollbackTransaction(transaction);
        }
        throw error;
    }
};


exports.bulkCreateAttendances = async (payload) => {
    payload = await this.validateBodyParameters(payload);
    const location = payload.headers['x-forwarded-for'] || payload.connection.remoteAddress;

    const attendanceRecordsPayload = await Promise.all(payload.body.map(async (attendance) => {
        const user = await userRepository.getUserById(attendance.user_uuid);
        if (!(user.isActive() && user.organization.isActive() && user.department.isActive() && user.organization_role?.isActive())) throw new ForbiddenError('User is currently inactive.');
        
        const record = {
            user_id: attendanceRepository.getLiteralFrom("user", attendance.user_uuid, 'user_id'),
            check_in: attendance.check_in,
            check_out: attendance.check_out,
            date: attendance.date,
            status: attendance.status,
            affected_hours: attendance.affected_hours,
            attendance_log: []
        };
        
        if (attendance.check_in) {
            record.attendance_log.push({
                time: attendance?.check_in,
                type: AttendanceLogType.ENUM.CHECK_IN,
                location
            })
        };
        
        if (attendance.check_out) {
            record.attendance_log.push({
                time: attendance?.check_out,
                type: AttendanceLogType.ENUM.CHECK_OUT,
                location
            })
        };
        
        if (attendance.attendance_log) {
            record.attendance_log = attendance.attendance_log;
        }
        
        return record;
    }));
    
    console.log('attendanceRecordsPayload: ', attendanceRecordsPayload);
    return attendanceRepository.bulkCreateAttendances(attendanceRecordsPayload);
};

exports.getAttendanceByCriteria = async (payload) => {
    const { user_uuid } = payload.params;
    return attendanceRepository.getAttendanceByCriteria({ user_uuid, date: new Date() });
}

