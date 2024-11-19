const { userService, leaveRequestService, attendanceService } = require("../services");
const { NotFoundError } = require("../middleware/error");
const { HTTP_STATUS_CODE } = require("../lib/constants");

exports.getFilteredUsers = async (req, res, next) => {
    try {
        const response = await userService.getFilteredUsers(req);
        if (!response.total) return res.status(HTTP_STATUS_CODE.ENUM.NO_CONTENT).json({ message: "No user found." });
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (err) {
        next(err);
    }
}

exports.getUserById = async (req, res, next) => {
    try {
        const response = await userService.getUserById(req);
        if (!response) throw new NotFoundError("User not found.", "User with provided id not found.");
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (err) {
        next(err);
    }
}

exports.getLeaveBalanceOfUser = async (req, res, next) => {
    try {
        const response = await userService.getLeaveBalanceOfUser(req);
        if (!response) throw new NotFoundError("User not found.", "User with provided id not found.");
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (err) {
        next(err);
    }
}

exports.getLeaveRequestsOfUser = async (req, res, next) => {
    try {
        req.query.user_uuid = req.params.user_uuid;
        const response = await leaveRequestService.getFilteredLeaveRequests(req);
        if (!response.total) return res.status(HTTP_STATUS_CODE.ENUM.NO_CONTENT).json({ message: "No leave requests found." });
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (error) {
        next(error);
    }
}

exports.getLeaveRequestOfUser = async (req, res, next) => {
    try {
        const response = await leaveRequestService.getLeaveRequestByUUID(req);
        if (!response) throw new NotFoundError("Leave request not found.");
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (error) {
        next(error);
    }
}

exports.getUserAttendance = async (req, res, next) => {
    try {
        const response = await attendanceService.getAttendanceByCriteria(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (error) {
        next(error);
    }
}

exports.createUser = async (req, res, next) => {
    try {
        const output = await userService.createUser(req);
        return res.json(output);
        res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "User created successfully." });
    } catch (error) {
        next(error);
    }
}

exports.updateUserById = async (req, res, next) => {
    try {
        await userService.updateUserById(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "User updated successfully." });
    } catch (err) {
        next(err);
    }
}

exports.activateUser = async (req, res, next) => {
    try {
        await userService.activateUser(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "User activated successfully." });
    } catch (err) {
        next(err);
    }
}

exports.deactivateUser = async (req, res, next) => {
    try {
        await userService.deactivateUser(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "User deactivated successfully." });
    } catch (err) {
        next(err);
    }
}

exports.verifyUser = async (req, res, next) => {
    try {
        const response = await userService.verifyUser(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (err) {
        next(err);
    }
}

exports.updatePassword = async (req, res, next) => {
    try {
        await userService.updatePassword(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Password updated successfully." });
    } catch (err) {
        next(err);
    }
}

exports.createLeaveRequestForUser = async (req, res, next) => {
    try {
        req.body.user_uuid = req.params.user_uuid;
        await leaveRequestService.createLeaveRequest(req);
        res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Leave request created successfully." });
    } catch (error) {
        next(error);
    }
}

exports.updateLeaveRequestOfUser = async (req, res, next) => {
    try {
        req.body.user_uuid = req.params.user_uuid;
        await leaveRequestService.updateLeaveRequest(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Leave request updated successfully." });
    } catch (error) {
        next(error);
    }
}

exports.deleteLeaveRequestOfUser = async (req, res, next) => {
    try {
        await leaveRequestService.deleteLeaveRequest(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Leave request deleted successfully." });
    } catch (error) {
        next(error);
    }
}

exports.recordUserCheckIn = async (req, res, next) => {
    try {
        await attendanceService.recordUserCheckIn(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Check-in recorded successfully." });
    } catch (error) {
        next(error);
    }
}

exports.recordUserCheckOut = async (req, res, next) => {
    try {
        await attendanceService.recordUserCheckOut(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Check-out recorded successfully." });
    } catch (error) {
        next(error);
    }
}

exports.getAttendanceReportOfUser = async (req, res, next) => {
    try {
        const response = await userService.getAttendanceReport(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (error) {
        next(error);
    }
}

exports.getLeaveReportOfUser = async (req, res, next) => {
    try {
        const response = await userService.getLeaveReport(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (error) {
        next(error);
    }
}

exports.updateUserPersonalDetails = async (req, res, next) => {
    try {
        const response = await userService.updateUserPersonalDetails(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({message: "User Personal Details are updated"});
    } catch (error) {
        console.log(error);
        next(error);
    }
}
